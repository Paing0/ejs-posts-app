const User = require("../models/user")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv").config

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
})

// render register page
exports.getRegisterPage = (req, res) => {
  let errorMsg = req.flash("error")
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0]
  } else {
    errorMsg = null
  }
  res.render("auth/register", { title: "Register", errorMsg })
}

// handle register
exports.registerAccount = (req, res) => {
  const { email, password } = req.body
  User.findOne({ email })
    .then((user) => {
      if (user) {
        req.flash("error", "Email already exist.")
        return res.redirect("/register")
      }
      return bcrypt.hash(password, 10).then((hashedPassword) => {
        return User.create({
          email,
          password: hashedPassword,
        }).then(() => {
          res.redirect("/login")
          transporter
            .sendMail({
              from: process.env.SENDER_MAIL,
              to: email,
              subject: "Register Successfully",
              html: "<h1>Registered account successfully</h1><p>You can login to the site using this email.</p>",
            })
            .catch((err) => {
              console.log(err)
            })
        })
      })
    })
    .catch((err) => console.log(err))
}

// render login page
exports.getLoginPage = (req, res) => {
  let errorMsg = req.flash("error")
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0]
  } else {
    errorMsg = null
  }
  res.render("auth/login", { title: "Login", errorMsg })
}

// handle login
exports.postLoginData = (req, res) => {
  const { email, password } = req.body
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash(
          "error",
          "Wrong user credentials. Check your email and password again."
        )
        return res.redirect("/login")
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true
            req.session.userInfo = user
            req.flash("success", "Login successful.")
            return req.session.save((err) => {
              res.redirect("/")
            })
          }
          return res.redirect("/login")
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

// handle logout
exports.postLogoutData = (req, res) => {
  req.session.destroy((_) => {
    res.redirect("/")
  })
}
