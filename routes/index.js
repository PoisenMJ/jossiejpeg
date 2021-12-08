var express = require('express');
var process = require('process');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Message = require('../models/message');
const {Comment} = require('../models/comment');
var io = require('socket.io')();
var router = express.Router();
var config = require('../config.json');
var authCheck = (config.DEVELOPMENT) ? development : isAuthenticated;
const crypto = require('crypto');


var multer = require('multer');
var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if(file.fieldname == "userImage") cb(null, './content/users');
    else cb(null, './content');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = '-' + Date.now() + '-' + Math.round(Math.random()*1E9)+'.';
    console.log(file);
    cb(null, file.fieldname+uniqueSuffix+(file.mimetype.split('/')[1]));
  }
})
var upload = multer({ storage: storage });

function development(req, res, next){
  return next();
}
function isAuthenticated(req, res, next){
  console.log('auth check');
  if(!req.user) return res.redirect('/login');
  next();
}

// TODO:
// stop login if banned flash after ban
// restrict post comments (double check)

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.post('/login', function(req, res, next) {
  console.log('login');
  passport.authenticate('local', (err, user, info) => {
    if(err) return res.redirect('/login?failure=true');
    if(!user) return res.redirect('/login?failure=true');
    req.login(user, (err) => {
      if(user.role == "admin") return res.redirect('/admin/upload');
      else return res.redirect('/home'); 
    })
  })(req, res, next);
});

router.get('/create-account', (req, res, next) => {
  res.render('create-account');
});
router.post('/create-account', (req, res, next) => {
  var newUser = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password
  });
  newUser.save((err) => {
    console.log(err);
    res.redirect('/login');
  });
});

router.get('/signout', function (req, res, next){
  
})

// GET: POSTS
// return all posts
router.get('/posts', authCheck, function(req, res, next) {
  Post.find({}, (err, posts) => {
    if(err) return err;
    for(let post in posts){
      if(posts[post].likes.includes("maksjl01")) posts[post]._doc.liked = true;
      else posts[post]._doc.liked = false;
    }
    console.log(posts);
    return res.json({ posts: posts });
  })
});

router.get('/home', authCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
});
router.post('/home/like', authCheck, function(req, res, next){
  var id = req.body.postID;
  console.log(req.body);
  Post.findOneAndUpdate({ _id: id }, { $addToSet: { likes: "maksjl01" }}, (err, post) => {
    if(err) console.log(err);
    console.log(post);
    return res.json({ success: true });
  })
});
router.post('/home/unlike', authCheck, function(req, res, next) {
  var id = req.body.postID;
  // chgange to req.user.username instead when not development
  Post.findOneAndUpdate({ _id: id }, { $pull : { likes: "maksjl01"}}, (err, post) => {
    if(err) console.log(err);
    console.log(post);
    return res.json({ success: true });
  })
});
router.post('/home/comment', authCheck, function(req, res, next) {
  var id = req.body.postID, content = req.body.comment, date = new Date().toString();
  var user = (development) ? "maksjl01" : req.user.username;
  var image = (development) ? "default.jpg" : req.user.image;
  
  Post.findOne({ _id: id }, (err, post) => {
    if(post.restrictedComments == false){
      var comment = new Comment({
        user: user,
        image: image,
        content: content,
        date: date,
        postID: id
      });
      comment.save((err, c) => {
        if(err) return res.json({ success: false }).status(400);
        console.log(comment);
        Post.findOneAndUpdate({ _id: id }, { $push: { comments: c }}, (err, post) => {
          if(err) return res.json({ success: false }).status(400);
          return res.json(c);
        })
      })
    } else {
      return res.json({ success: false });
    }
  })
})
router.get('/message', authCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
})

router.post('/user/check', authCheck, function(req, res, next) {
  var user = req.body.user;
  if(req.user.username == user) return res.json({ success: true });
  else return res.json({ success: false });
});

router.get('/user', authCheck, function(req, res, next) {
  // var user = (config.DEVELOPMENT) ?
  // {"username": "maksjl01",
  // "firstName": "Maks",
  // "lastName": "lewis",
  // "image": "default.jpg",
  // "email": "maksjl01@gmail.com"} : req.user;
  User.findOne({ username: "maksjl01" }, (err, user) => {
    if(config.DEVELOPMENT) return res.json(user);
    else return res.json(req.user);

  })
})

// GET: MESSAGES
// return all messages from database for speicific use
router.get('/messages', authCheck, function(req, res, next){
  var user = (config.DEVELOPMENT) ? config.DEVELOPMENT_TEST_USER_USERNAME : req.user.username;
  console.log('messages');
  Message.find({$or: [
    {from: user},
    {to: user}
  ]}, (err, messages) => {
    if(err) return err;
    console.log(messages);
    return res.json({ messages: messages });
  })
});


// GET: image
// return images if user access level is appropriate and no path traversing
router.get('/image', authCheck, function(req, res, next) {
  var contentDirectory = process.cwd() + '/content';
  var path = contentDirectory+req.query.filename;
  if(path.indexOf(contentDirectory) !== -1){
    res.set({"Content-Type": "image/*"});
    return res.sendFile(path);
  }
})

// POST: MESSAGE
// add message to database and return it with style tag: "incoming"/"outgoing"
router.post('/message', authCheck, upload.single('image'), function(req, res, next) {
  var user = (config.DEVELOPMENT) ? config.DEVELOPMENT_TEST_USER_USERNAME : req.user.username;
  var image = (config.DEVELOPMENT) ? "default.jpg" : req.user.image;
  
  var d = new Date();
  var msgContent = (req.file) ? "" : req.body.content;
  var msgType = (req.body.type) ? req.body.type : "message";
  var msgObj = {
    content: msgContent,
    from: user,
    to: 'jossiejpeg',
    type: msgType,
    imageContent: (req.file) ? req.file.filename : "",
    date: d.getHours() + ":" + d.getMinutes() + " " + d.getDate() + "/" + d.getMonth(),
    image: image
  }
  console.log(msgObj);
  var msg = new Message(msgObj);
  io.emit('chat message', req.body.content);
  msg.save((err) => {
    if(err) return err;
    var editedMsg = msgObj;
    editedMsg['style'] = (msg.from == user) ? "outgoing" : "incoming";
    if(err) return res.status(400);
    return res.status(200).json(editedMsg);
  });
});

router.post('/message/read', authCheck, function(req, res, next) {
  var user1 = req.body.user1;
  var user2 = req.body.user2;
  Message.updateMany({$or: [{to: user1, from: user2},{to: user2, from: user1}]}, {$set: {read: true}}, (err, user) => {
    return res.status(200).json({success: true});
  })
});

router.get('/username/check/:username', authCheck, function(req, res, next) {
  var username = req.query.username;
  User.find({ username: username }, (err, user) => {
    console.log(user);
    console.log(err);
    if(err) res.json({ available: false });
    else return res.json({ available: true });
  })
});

router.get('/email/check/:email', authCheck, function(req, res, next) {
  var email = req.query.email;
  User.find({ email: email }, (err, user) => {
    if(err) res.json({ available: false });
    else return res.json({ available: true });
  })
})

router.post('/user/update',authCheck,upload.single('userImage'), async function (req, res, next) {
  var username = (config.DEVELOPMENT) ? "maksjl01" : req.user.username;
  
  if(req.body.password){
    var hashed_password = crypto.createHash('md5').update(req.body.password).digest('hex');
    var u = await User.updateOne({ username: username }, { $set: {
      password: hashed_password
    }});
  }
  if(req.file){
    var filename = req.file.filename;
    var u = await User.updateOne({ username: username}, { $set: {
      image: filename
    }});
  }
  return res.json({ success: true });
})

// // GET /
// render login
router.get('/', function(req, res) {
  res.redirect('/login');
})

module.exports = router;
