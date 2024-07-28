const Post = require("../models/post")

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  Post.create({
    title,
    description,
    imageUrl: photo,
  })
    .then((result) => {
      console.log(result)
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.renderCreatePage = (req, res) => {
  res.render("createPost", { title: "Create Post" })
}

exports.getPosts = (req, res) => {
  Post.findAll({ order: [["createdAt", "desc"]] })
    .then((posts) => {
      res.render("home", { title: "Home", postsArr: posts })
    })
    .catch((err) => console.log(err))
}

exports.getPost = (req, res) => {
  const postId = req.params.postId
  Post.findByPk(postId)
    .then((post) => {
      res.render("details", { title: "Post Details Page", post })
    })
    .catch((err) => console.log(err))
}

exports.deletePost = (req, res) => {
  const postId = req.params.postId
  Post.findByPk(postId)
    .then((post) => {
      if (!post) {
        res.redirect("/")
      }
      return post.destroy()
    })
    .then((result) => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}
exports.getOldPost = (req, res) => {
  const postId = req.params.postId
  Post.findByPk(postId)
    .then((post) => {
      res.render("editPost", { title: `${post.title}`, post })
    })
    .catch((err) => console.log(err))
}

exports.updatePost = (req, res) => {
  const { title, description, photo, postId } = req.body
  Post.findByPk(postId)
    .then((post) => {
      post.title = title
      post.imageUrl = photo
      post.description = description
      return post.save()
    })
    .then((result) => {
      console.log("Post id updated")
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}
