const Post = require("../models/post")

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  Post.create({ title, description, imgUrl: photo, userId: req.user })
    .then((result) => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.renderCreatePage = (req, res) => {
  res.render("createPost", { title: "Create Post" })
}

exports.renderHomePage = (req, res) => {
  // const cookie = req.get("Cookie").split("=")[1].trim() === "true" || false
  Post.find()
    .select("title")
    .populate("userId", "username")
    .sort({ title: 1 })
    .then((posts) =>
      res.render("home", {
        title: "Home",
        postsArr: posts,
        isLogin: req.session.isLogin ? true : false,
      })
    )
    .catch((err) => console.log(err))
}

exports.getPost = (req, res) => {
  const postId = req.params.postId
  Post.findById(postId)
    .then((post) => res.render("details", { title: post.title, post }))
    .catch((err) => console.log(err))
}

exports.getEditPost = (req, res) => {
  const postId = req.params.postId
  Post.findById(postId)
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
  Post.findById(postId)
    .then((post) => {
      post.title = title
      post.description = description
      post.imgUrl = photo
      return post.save()
    })
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.deletePost = (req, res) => {
  const { postId } = req.params
  Post.findByIdAndDelete(postId)
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}
