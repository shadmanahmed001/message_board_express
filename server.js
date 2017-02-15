// require express and create the app
var express = require('express');
var app = express();

// require body-parser and activate it
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// require path and use it to set the views path
var path = require('path');
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// require mongoose and configure the schemas
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/messageboard');
var Schema = mongoose.Schema;

var CommentSchema = new mongoose.Schema({
  name: {
    type: String,
    min: [4, 'name must be at least four characters'],
    required: [true, 'name is required']
  },
  comment: {
    type: String,
    required: [true, 'comment is required']
  },
  _post: {type: Schema.Types.ObjectId, ref: "Post"}
}, {timestamp: true});

var PostSchema = new mongoose.Schema({
  name: {
    type: String,
    min: [4, 'name must be at least four characters'],
    required: [true, 'name is required']
  },
  message: {
    type: String,
    required: [true, 'message is required']
  },
  comments: [{type: Schema.Types.ObjectId, ref: "Comment"}]
}, {timestamp: true});


mongoose.model("Comment", CommentSchema);
var Comment = mongoose.model("Comment");

mongoose.model("Post", PostSchema);
var Post = mongoose.model("Post");


// routes
app.get("/", function(req, res){
  Post.find().populate('comments').exec(function(err, posts){
    if (err){
      console.log("ERROR: ", err);
    } else {
      console.log("POSTS: ", posts);
      res.render("index", {posts: posts});
    }
  });
})


app.post("/post", function(req, res){
  console.log(req.body);
  var post = new Post({name: req.body.name, message: req.body.message});
  post.save(function(err){
    if (err){
      console.log("ERROR: ", err);
    } else {
      console.log("Post saved");
      res.redirect("/");
    };
  })
})

app.post("/comment", function(req, res){
  console.log(req.body);
  var post = Post.findOne({ _id: req.body.id }, function(err,post){
    var comment = new Comment({name: req.body.name, comment: req.body.comment});
    comment._post = post._id;
    comment.save(function(err){
      post.comments.push(comment);
      post.save(function(err){
        if (err){
          console.log(err);
        } else{
          res.redirect('/')
        }
      })
    })
  })
})

app.listen(8000, function(){
    console.log("listening on port 8000")
})
