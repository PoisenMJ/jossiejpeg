var express = require('express');
var path = require('path');
var process = require('process');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Message = require('../models/message');
var io = require('socket.io')();
var router = express.Router();
var fs = require('fs');
var config = require('../config.json');

var authCheck = (config.development) ? (req, res, next) => next() : isAuthenticated;
var adminCheck = (config.development) ? (req, res, next) => next() : isAdmin;

var multer = require('multer');
var storage = multer.diskStorage({
  destination: './content',
  filename: (req, file, cb) => {
    const uniqueSuffix = '-' + Date.now() + '-' + Math.round(Math.random()*1E9)+'.';
    console.log(file);
    cb(null, file.fieldname+uniqueSuffix+(file.mimetype.split('/')[1]));
  }
})
var upload = multer({ storage: storage });

function isAuthenticated(req, res, next){
  if(!req.user) return res.redirect('/login');
  next();
}
function isAdmin(req, res, next){
  console.log(req.user);
  if(req.user){
    if(req.user.role === "admin") return next();
  }
  return res.redirect('/login');
}


/* GET home page. */
router.get('/login', function(req, res, next) {
  res.render('login');
});
router.post('/login', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err) return res.redirect('/login');
    if(!user) return res.redirect('/login');
    req.login(user, (err) => {
      return res.redirect('/home');
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
    if(err) res.redirect('/create-account');
    else res.redirect('/login');
  });

})

router.get('/upload', adminCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
});

router.post('/upload', upload.any('content'), function(req, res, next) {
  var fileNames = [];
  console.log(req.body);
  console.log(req.files);
  for(let i = 0; i < req.files.length; i++){
    fileNames.push(req.files[i].filename);
  }
  var d = new Date();
  var newPost = new Post({
    datePosted: d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear(),
    description: req.body.description,
    content: fileNames
  });
  newPost.save((err, post) => {
    if(err) return err;
    return res.json(post);
  })
});

// GET: POSTS
// return all posts
router.get('/posts', authCheck, function(req, res, next) {
  Post.find({}, (err, posts) => {
    if(err) return err;
    return res.json({ posts: posts });
  })
});

router.post('/removePost', adminCheck, function(req, res, next) {
  Post.findByIdAndRemove({ _id: req.body.id }, (err, post) => {
    if(err) console.log(err);
    console.log(post);
    return res.json({ success: true });
  })
})

router.get('/home', authCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
});

router.get('/message', authCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
})

// GET: MESSAGES
// return all messages from database for speicific use
router.get('/messages', authCheck, function(req, res, next){
  Message.find({$or: [
    {from: req.user.username},
    {to: req.user.username}
  ]}, (err, messages) => {
    if(err) return err;
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
router.post('/message', upload.single('image'), function(req, res, next) {
  var user = req.user.username;
  var d = new Date();
  var msgContent = (req.file) ? "" : req.body.content;
  var msgObj = {
    content: msgContent,
    from: user,
    to: 'jossiejpeg',
    imageContent: (req.file) ? req.file.filename : "",
    date: d.getHours() + ":" + d.getMinutes() + " " + d.getDate() + "/" + d.getMonth(),
    // image: req.user.image
    image: req.user.image
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

router.post('/admin/message', adminCheck, function(req, res, next) {
  var d = new Date();
  var msgObj = {
    content: req.body.content, 
    from: 'jossiejpeg',
    to: req.body.to,
    date: d.getHours()+":"+d.getMinutes()+" "+d.getDate()+"/"+d.getMonth(),
    image: "pfp.jpg"
  }
  var msg = new Message(msgObj);
  io.emit('chat message', req.body.content);
  msg.save((err) => {
    var editedMsg = msgObj;
    editedMsg['style'] = "outgoing";
    return res.status(200).json(editedMsg);
  })
})

router.get('/admin/message', function(req, res, next) {
  // Message.find({})
  // res.render('admin-messages');
  res.sendFile('/dist/index.html', { root: process.cwd() });
});

router.get('/getAdminMessageReady', function(req, res, next) {
  Message.find({$or: [
    { user: 'jossiejpeg' },
    { to: 'jossiejpeg' }
  ]}, (err, messages) => {
    var m = {};
    for(var i = 0; i < messages.length; i++){
      var curr = messages[i].from == 'jossiejpeg' ? messages[i].to : messages[i].from;
      if(!m[curr]){
        m[curr] = []
        m[curr].push({
          from: messages[i].from,
          imageContent: messages[i].messageContent,
          to: messages[i].to,
          image: messages[i].image,
          date: messages[i].date,
          content: messages[i].content,
          read: messages[i].read
        });
      }
    else m[curr].push(messages[i]);
    }
    console.log(m)
    return res.json({content: JSON.stringify(m)});
  })
});
router.post('/message/read', function(req, res, next) {
  var user1 = req.body.user1;
  var user2 = req.body.user2;
  Message.updateMany({$or: [{to: user1, from: user2},{to: user2, from: user1}]}, {$set: {read: true}}, (err, user) => {
    return res.status(200).json({success: true});
  })
});

// // GET /
// render login
router.get('/', function(req, res) {
  // console.log('hello');
  res.redirect('/login');
  // res.send("HEY");
})

module.exports = router;
