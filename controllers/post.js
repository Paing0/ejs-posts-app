const Post = require("../models/post")

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  const post = new Post(title, description, photo)
  post
    .create()
    .then((result) => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "createpost.html"))
  res.render("createPost", { title: "Create Post" })
}

exports.renderHomePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "homepage.html"))
  Post.getPosts()
    .then((posts) => res.render("home", { title: "Home", postsArr: posts }))
    .catch((err) => console.log(err))
}

exports.getPost = (req, res) => {
  const postId = req.params.postId
  Post.getPost(postId)
    .then((post) => res.render("details", { title: post.title, post }))
    .catch((err) => console.log(err))
}

exports.getEditPost = (req, res) => {
  const postId = req.params.postId
  Post.getPost(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/")
      }
      res.render("editPost", { title: post.title, post })
    })
    .catch((err) => console.log(err))
}

exports.updatePost = (req, res) => {
  const { title, description, photo, postId } = req.body
  const post = new Post(title, description, photo, postId)

  post
    .create()
    .then(() => {
      console.log("Post Updated")
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.deletePost = (req, res) => {
  const { postId } = req.params
  Post.deleteById(postId)
    .then(() => {
      console.log(postId)
      console.log("Post Deleted")
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}
