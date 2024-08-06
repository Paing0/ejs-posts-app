const Post = require("../models/post")

exports.createPost = (req, res) => {
  const { title, description, photo } = req.body
  Post.create({ title, description, imgUrl: photo, userId: req.user }) // create a new post with the given data
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}

exports.renderCreatePage = (req, res) => {
  res.render("createPost", { title: "Create Post" })
}

exports.renderHomePage = (req, res) => {
  let loginSuccessful = req.flash("success") // get flash message with "success" key
  if (loginSuccessful.length > 0) {
    loginSuccessful = loginSuccessful[0] // if flash message exists, use the first one
  } else {
    loginSuccessful = null //else
  }
  Post.find() // find all posts
    .select("title description imgUrl") // select the title and description field
    .populate("userId", "email") // populate the userId field with the email from the User model
    .sort({ title: 1 }) // sort posts by title in ascending order
    .then((posts) =>
      res.render("home", {
        // render the home page
        title: "Home",
        postsArr: posts, // pass the arrays as posts
        loginSuccessful, // pass the loginSuccessful message
        currentUserEmail: req.session.userInfo // pass the current user's email if logged in
          ? req.session.userInfo.email
          : "",
      })
    )
    .catch((err) => console.log(err))
}

// render details page of the  post
exports.getPost = (req, res) => {
  const postId = req.params.postId // get postId from params
  Post.findById(postId)
    .then((post) =>
      res.render("details", {
        title: post.title,
        post,
        currentLoginUserId: req.session.userInfo // check if userInfo exist
          ? req.session.userInfo._id // pass the current user's id if logged in
          : "",
      })
    ) // pass in the whole post array
    .catch((err) => console.log(err))
}

// render the edit page for a specific post
exports.getEditPost = (req, res) => {
  const postId = req.params.postId // get postId from params
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/") // if post not found redirect to home page
      }
      res.render("editPost", { title: post.title, post }) // else pass in the whole post array
    })
    .catch((err) => console.log(err))
}

// data to update a post
exports.updatePost = (req, res) => {
  const { title, description, photo, postId } = req.body // get all the data from req.body
  Post.findById(postId)
    // update the post
    .then((post) => {
      // redirect to the home page if the userId of the current post is not equal to the current user's ID
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/")
      }
      post.title = title
      post.description = description
      post.imgUrl = photo
      // save the post
      return post.save().then(() => {
        res.redirect("/") // redirect to homepage if successful
      })
    })
    .catch((err) => console.log(err))
}

exports.deletePost = (req, res) => {
  const { postId } = req.params
  // delete the post if the _id(postId in db basically) from db is equal to postId from params && if the userId from db is equal to the current user
  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => console.log(err))
}
