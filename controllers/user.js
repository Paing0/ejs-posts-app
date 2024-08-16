const { validationResult } = require("express-validator")
const User = require("../models/user")

const Post = require("../models/post")
const POST_PER_PAGE = 6

exports.getProfile = (req, res, next) => {
  const pageNumber = +req.query.page || 1
  let totalPostNumber
  Post.find({ userId: req.user._id })
    .countDocuments()
    .then((totalPost) => {
      totalPostNumber = totalPost
      return Post.find({ userId: req.user._id })
        .populate("userId", "email username")
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .sort({ createdAt: -1 })
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/profile", {
          title: req.session.userInfo.email,
          postsArr: posts,
          currentPage: pageNumber,
          hasNextPage: POST_PER_PAGE * pageNumber < totalPostNumber,
          hasPreviousPage: pageNumber > 1,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
          currentUserEmail: req.session.userInfo
            ? req.session.userInfo.email
            : "",
        })
      } else {
        return res.status(500).render("error/500", {
          title: "Something went wrong.",
          message: "No post found in this page.",
        })
      }
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't render profile page")
      return next(error)
    })
}

exports.getPublicProfile = (req, res, next) => {
  const { id } = req.params
  const pageNumber = +req.query.page || 1
  let totalPostNumber
  Post.find({ userId: id })
    .countDocuments()
    .then((totalPost) => {
      totalPostNumber = totalPost
      return Post.find({ userId: id })
        .populate("userId", "email")
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .sort({ createdAt: -1 })
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/public-profile", {
          title: posts[0].userId.email,
          postsArr: posts,
          currentPage: pageNumber,
          hasNextPage: POST_PER_PAGE * pageNumber < totalPostNumber,
          hasPreviousPage: pageNumber > 1,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
          currentUserEmail: posts[0].userId.email,
        })
      } else {
        return res.status(500).render("error/500", {
          title: "Something went wrong.",
          message: "No post found in this page.",
        })
      }
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("Can't render profile page")
      return next(error)
    })
}

exports.renderUsernamePage = (req, res) => {
  let errorMsg = req.flash("error")
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0]
  } else {
    errorMsg = null
  }
  res.render("user/username", {
    title: "Set Username",
    errorMsg,
    oldFormData: { username: "" },
  })
}

exports.setUsername = (req, res, next) => {
  const { username } = req.body
  const updateUsername = username.replace(/@/g, "")

  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log(username)
    return res.status(422).render("user/username", {
      title: "Reset Password",
      errorMsg: errors.array()[0].msg,
      oldFormData: { username },
    })
  }

  User.findById(req.user._id)
    .then((user) => {
      user.username = `@${updateUsername}`
      return user.save().then(() => {
        res.redirect("/admin/profile")
      })
    })
    .catch((err) => {
      console.log(err)
      const error = new Error("User not found with this ID.")
      return next(error)
    })
}

exports.renderPremiumPage = (req, res) => {
  res.render("user/premium", { title: "premium" })
}
