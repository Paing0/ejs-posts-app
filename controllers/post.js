const posts = []

const Post = require("../models/post")

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  const post = new Post(title, description, photo)
  post
    .setPost()
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
  // posts.push({
  //   id: Math.random(),
  //   title,
  //   description,
  //   photo,
  // })
}

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "createpost.html"))
  res.render("createPost", { title: "Create Post" })
}

exports.getPosts = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "homepage.html"))
  Post.getAllPost()
    .then(([rows]) => {
      console.log(rows)
      res.render("home", { title: "Home", postsArr: rows })
    })
    .catch((err) => console.log(err))
}

exports.getPost = (req, res) => {
  const postId = req.params.postId
  // const post = posts.find((post) => post.id == postId)
  Post.getSinglePost(postId)
    .then(([row]) => {
      console.log(row)
      res.render("details", { title: "Post Details Page", post: row[0] })
    })
    .catch((err) => console.log(err))
}
