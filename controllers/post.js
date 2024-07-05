const posts = []

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  posts.push({
    id: Math.random(),
    title,
    description,
    photo,
  })
  res.redirect("/")
}

exports.renderCreatePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "createpost.html"))
  res.render("createPost", { title: "Create Post" })
}

exports.renderHomePage = (req, res) => {
  // res.sendFile(path.join(__dirname, "..", "views", "homepage.html"))
  res.render("home", { title: "Home", postsArr: posts })
}

exports.getPost = (req, res) => {
  const postId = req.params.postId
  const post = posts.find((post) => post.id == postId)
  res.render("details", { title: "Post Details Page", post })
}
