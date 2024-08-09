const Post = require("../models/post")
const deleteFile = require("../utils/deleteFile")
const { validationResult } = require("express-validator")
const { formatISO9075 } = require("date-fns")
const pdf = require("pdf-creator-node")
const fs = require("fs")
const expressPath = require("path")

exports.createPost = (req, res, next) => {
  const { title, description } = req.body
  const image = req.file
  const errors = validationResult(req)

  if (image === undefined) {
    return res.status(422).render("createPost", {
      title: "Create Post",
      errorMsg: "Image extension must be jpg, jpeg or png",
      oldFormData: { title, description },
    })
  }

  if (!errors.isEmpty()) {
    return res.status(422).render("createPost", {
      title: "Create Post",
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, description, photo },
    })
  }
  Post.create({ title, description, imgUrl: image.path, userId: req.user }) // create a new post with the given data
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't create post")
      return next(error)
    })
}

exports.renderCreatePage = (req, res, next) => {
  res.render("createPost", {
    title: "Create Post",
    oldFormData: { title: "", description: "", photo: "" },
    errorMsg: "",
  })
}

exports.renderHomePage = (req, res, next) => {
  let loginSuccessful = req.flash("success") // get flash message with "success" key
  if (loginSuccessful.length > 0) {
    loginSuccessful = loginSuccessful[0] // if flash message exists, use the first one
  } else {
    loginSuccessful = null //else
  }
  Post.find() // find all posts
    .select("title description imgUrl") // select the fields
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
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't render Home Page")
      return next(error)
    })
}

// render details page of the post
exports.getPost = (req, res, next) => {
  const postId = req.params.postId // get postId from params
  Post.findById(postId)
    .populate("userId", "email")
    .then((post) =>
      res.render("details", {
        title: post.title,
        post,
        date: formatISO9075(post.createdAt, { representation: "date" }),
        currentLoginUserId: req.session.userInfo // check if userInfo exist
          ? req.session.userInfo._id // pass the current user's id if logged in
          : "",
      })
    ) // pass in the whole post array
    .catch((err) => {
      console.log(err)
      const error = new Error("Post not found")
      return next(error)
    })
}

// render the edit page for a specific post
exports.getEditPost = (req, res, next) => {
  const postId = req.params.postId // get postId from params
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/") // if post not found redirect to home page
      }
      res.render("editPost", {
        title: post.title,
        post,
        errorMsg: "",
        oldFormData: { title: "", description: "", photo: "" },
        isValidationFail: false,
      }) // else pass in the whole post array
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't render Edit Page")
      return next(error)
    })
}

// data to update a post
exports.updatePost = (req, res, next) => {
  const { title, description, postId } = req.body // get all the data from req.body
  const image = req.file
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("editPost", {
      title,
      postId,
      errorMsg: errors.array()[0].msg,
      oldFormData: { title, description },
      isValidationFail: true,
    })
  }
  Post.findById(postId)
    // update the post
    .then((post) => {
      // redirect to the home page if the userId of the current post is not equal to the current user's ID
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/")
      }
      post.title = title
      post.description = description
      if (image) {
        deleteFile(post.imgUrl)
        post.imgUrl = image.path
      }
      // save the post
      return post.save().then(() => {
        res.redirect("/") // redirect to homepage if successful
      })
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't update post")
      return next(error)
    })
}

exports.deletePost = (req, res, next) => {
  const { postId } = req.params
  // delete the post if the _id(postId in db basically) from db is equal to postId from params && if the userId from db is equal to the current user
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/")
      }
      deleteFile(post.imgUrl)
      return Post.deleteOne({ _id: postId, userId: req.user._id })
    })
    .then(() => {
      res.redirect("/")
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't delete post")
      return next(error)
    })
}
