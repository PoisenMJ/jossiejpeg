var express = require('express');
var process = require('process');
const passport = require('passport');
const Post = require('../models/post');
const User = require('../models/user');
const Sub = require('../models/subscription');
const Message = require('../models/message');
const { Comment } = require('../models/comment');
var io = require('socket.io')();
var router = express.Router();
var data = require('../config.json');
const crypto = require('crypto');
const stripe = require('stripe')(data.STRIPE_DEV_KEY);


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
  if(!req.user) return res.redirect('/login');
  next();
}
var authCheck = (data.DEV) ? development : isAuthenticated;

// TODO:
// stop login if banned flash after ban

/* GET home page. */
router.get('/login', function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
});
router.post('/login', function(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if(err) return res.redirect('/login?failure=true');
    if(!user) return res.redirect('/login?failure=true');
    req.login(user, (err) => {
      if(user.role == "admin") return res.redirect('/admin/upload');
      else if(user.role == "user") {
        Sub.findOne({ user: user.username }, (err, sub) => {
          if(sub){
            if(sub.active) return res.redirect('/home');
            else if(!sub.active) return res.redirect('/payment/subscribe');
          }
          else return res.redirect('/payment/subscribe');
        })
      }
    })
  })(req, res, next);
});

router.get('/create-account', (req, res, next) => {
  res.sendFile('dist/index.html', { root: process.cwd() });
});
router.post('/create-account', upload.any('content'), (req, res, next) => {
  User.exists({ username: req.body.username }, (err, result) => {
    if(err) return res.json({ success: false, message: "Username Unavailable" })
    if(result) return res.json({ success: false, message: "Username Unavailable" })
    else {
      User.exists({ email: req.body.email }, (err, result) => {
        if(err) return res.json({ success: false, message: "Failed" })
        if(result) return res.json({ success: false, message: "Email Taken" })
        else {
          var newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: req.body.password,
            username: req.body.username
          });
          newUser.save((err) => {
            if(err) return res.json({ success: false, message: "Account Creation Failed" });
            else return res.json({ success: true, message: "" });
          });
        }
      });
    }
  });

});

router.get('/signout', authCheck, function (req, res, next){
  req.logout();
  res.redirect('/login');
});

router.get('/gallery', authCheck, function(req, res, next) {
  res.sendFile('dist/index.html', { root: process.cwd() });
});

// GET: POSTS
// return all posts
router.get('/posts', authCheck, function(req, res, next) {
  Post.find({}, (err, posts) => {
    if(err) return err;
    for(let post in posts){
      let user = req.user.username;
      if(posts[post].likes.includes(user)) posts[post]._doc.liked = true;
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
  let user = req.user.username;
  Post.findOneAndUpdate({ _id: id }, { $addToSet: { likes: user }}, (err, post) => {
    if(err) console.log(err);
    console.log(post);
    return res.json({ success: true });
  })
});
router.post('/home/unlike', authCheck, function(req, res, next) {
  var id = req.body.postID;
  let user = req.user.username;
  Post.findOneAndUpdate({ _id: id }, { $pull : { likes: user}}, (err, post) => {
    if(err) console.log(err);
    console.log(post);
    return res.json({ success: true });
  })
});
router.post('/home/comment', authCheck, function(req, res, next) {
  var id = req.body.postID, content = req.body.comment, date = new Date().toString();
  var user = req.user.username;
  var image = req.user.image;
  
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
    return res.json(req.user);
});

// GET: MESSAGES
// return all messages from database for speicific use
router.get('/messages', authCheck, function(req, res, next){
  var user = req.user.username;
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
  var user = req.user.username;
  var image = req.user.image;
  
  var d = new Date();
  var msgContent = (req.file) ? "" : req.body.content;
  var msgType = (req.body.type) ? req.body.type : "message";
  var msgObj = {
    content: msgContent,
    from: user,
    to: 'jossijpeg',
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

router.post('/user/update',authCheck,upload.single('userImage'), async function (req, res, next) {
  var username = req.user.username;
  var newCard = false;
  if(req.body.cardNumber){
    const user = await Sub.findOne({ user: req.user.username });
    if(user){
      const customer = await stripe.customers.retrieve(user.customerID);
      const expiry = req.body.expiry.split("/");
      const new_payment_method = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: req.body.cardNumber,
          exp_month: parseInt(expiry[0].trim()),
          exp_year: parseInt(expiry[1].trim()),
          cvc: req.body.cvc
        },
        billing_details: { name: req.body.cardHolder }
      });
      console.log(customer);
      const attached = await stripe.paymentMethods.attach(
        new_payment_method.id,
        {customer: customer.id}
      );
      await stripe.customers.update(
        customer.id,
        { invoice_settings: { default_payment_method: new_payment_method.id }}
      );
      newCard = true;
    } else return res.json({ success: false });
  }

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
  return res.json({ success: true, newCard });
})

// // GET /
// render login
router.get('/', function(req, res) {
  res.redirect('/login');
})

module.exports = router;
