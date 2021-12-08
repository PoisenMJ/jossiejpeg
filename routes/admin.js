var express = require('express');
var router = express.Router();
var config = require('../config.json');
var adminCheck = (config.DEVELOPMENT) ? (req, res, next) => next() : isAdmin;
const Message = require('../models/message');
var io = require('socket.io')();
var statsHelper = require('../helpers/statsHelper');

var multer = require('multer');
const Post = require('../models/post');
const User = require('../models/user');
var storage = multer.diskStorage({
    destination: './content',
    filename: (req, file, cb) => {
        const uniqueSuffix = '-' + Date.now() + '-' + Math.round(Math.random()*1E9)+'.';
        console.log("MULTER LOGGING:::");
        console.log(file);
        cb(null, file.fieldname+uniqueSuffix+(file.mimetype.split('/')[1]));
    }
})
var upload = multer({ storage: storage });

function isAdmin(req, res, next){
    console.log(req.user);
    if(req.user){
        if(req.user.role === "admin") return next();
    }
    return res.redirect('/login');
}

router.get('/', adminCheck, function(req, res, next) {
    return res.redirect('/upload');
})
router.get('/statements', adminCheck, function(req, res, next) {
    res.sendFile('dist/index.html', { root: process.cwd() });
});
router.get('/upload', adminCheck, function(req, res, next) {
    res.sendFile('dist/index.html', { root: process.cwd() });
});
router.post('/upload', adminCheck, upload.any('content'), function(req, res, next) {
    var fileNames = [];
    for(let i = 0; i < req.files.length; i++){
        fileNames.push(req.files[i].filename);
    }
    var d = new Date();
    var newPost = new Post({
        datePosted: d.getDate()+'/'+d.getMonth()+'/'+d.getFullYear(),
        description: req.body.description,
        restrictedComments: req.body.restrictComments,
        content: fileNames
    });
    newPost.save((err, post) => {
        if(err) return err;
        console.log(post);
        return res.json(post);
    })
});
router.post('/update-post', adminCheck, upload.array(), async function(req, res, next) {
    if(req.body.description != null)
        await Post.updateOne({_id: req.body.id}, {
            $set: {
                description: req.body.description
            }
        })
    if(req.body.restrictComments != null)
        await Post.updateOne({_id: req.body.id}, {
            $set: {
                restrictedComments: req.body.restrictComments
            }
        })
    return res.json({ success: true });
})
router.post('/remove-post', adminCheck, function(req, res, next) {
    console.log(req.body.id);
    Post.findOneAndRemove( { _id: req.body.id }, (err, post) => {
        if(err) console.log(err);
        console.log(post);
        return res.json({ success: true });
    })
});

router.get('/message', adminCheck, function(req, res, next) {
    res.sendFile('/dist/index.html', { root: process.cwd() });
});
router.post('/message', adminCheck, function(req, res, next) {
    var d = new Date();
    var msgObj = {
        content: req.body.content, 
        from: 'jossiejpeg',
        to: req.body.to,
        date: d.getHours()+":"+d.getMinutes()+" "+d.getDate()+"/"+d.getMonth(),
        image: "pfp.jpg",
        type: "message"
    }
    var msg = new Message(msgObj);
    io.emit('chat message', req.body.content);
    msg.save((err) => {
        var editedMsg = msgObj;
        editedMsg['style'] = "outgoing";
        return res.status(200).json(editedMsg);
    })
});

router.get('/message/ready', adminCheck, function(req, res, next) {
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
                type: messages[i].type,
                read: messages[i].read
            });
        }
        else m[curr].push(messages[i]);
        }
        return res.json({content: JSON.stringify(m)});
    })
});

router.post('/check', adminCheck, function(req, res, next) {
    var user = req.body.user;
    if(user == req.user.username && req.user.role == 'admin') return res.json({ success: true });
    else return res.json({ success: false });
});


router.get('/stats/allyears', adminCheck, async function(req, res, next) {
    statsHelper.getNumYearsOfData().then(data => {
        return res.json(data);
    })
});

router.get('/stats/top', adminCheck, async function(req, res, next) {
    statsHelper.getTopUsers().then(data => {
        // console.log(data);
        return res.json(data);
    })
});

router.get('/stats/:year', adminCheck, async function(req, res, next) {
    var year = req.params.year;
    statsHelper.getTotalYearRevenue(year).then(data => {
        return res.json(data);
    });
});

router.get('/stats/:year/:month', adminCheck, async function(req, res, next) {
    var year = req.params.year;
    var month = req.params.month;
    statsHelper.getMonthRevenue(year, month).then(data => {
        return res.json(data);
    })
});

router.get('/all-users', adminCheck, function(req, res, next) {
    User.find({"role": "user"}, (err, users) => {
        var returnData = [];
        for(var i = 0; i < users.length; i++){
            var temp = {};
            temp['username'] = users[i].username;
            temp['firstName'] = users[i].firstName;
            temp['lastName'] = users[i].lastName;
            temp['image'] = users[i].image;
            temp['email'] = users[i].email;
        }
        return res.json(users);
    })
});

router.get('/ban/:email', adminCheck, function(req, res, next) {
    User.updateOne({ email: req.query.email }, { $set: { role: "banned" }}, (err, result) => {
        if(err) console.log(err)
        console.log(result)
        return res.json(result);
    })
})

module.exports = router;