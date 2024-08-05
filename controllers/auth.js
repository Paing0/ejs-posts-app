const User = require("../models/user")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
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

// render reset password page
exports.getResetPage = (req, res) => {
  let errorMsg = req.flash("error")
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0]
  } else {
    errorMsg = null
  }
  res.render("auth/reset", { title: "Reset Password", errorMsg })
}

// render feedback page
exports.getFeedbackPage = (req, res) => {
  res.render("auth/feedback", { title: "Success" })
}

// send reset password link
exports.resetPasswordLink = (req, res) => {
  const { email } = req.body
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect("/reset-password")
    }
    const token = buffer.toString("hex")
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account found with this email.")
          return res.redirect("/reset-password")
        }
        user.resetToken = token
        user.tokenExpiration = Date.now() + 1800000
        return user.save()
      })
      .then(() => {
        res.redirect("/feedback")
        transporter.sendMail(
          {
            from: process.env.SENDER_MAIL,
            to: email,
            subject: "Reset Password",
            html: `<h1>Reset password.</h1><p>Change your password by clicking the link below.</p><a href="http://localhost:8080/reset-password/${token}" target="_blank">Click me to change password</a>`,
          },
          (err) => {
            console.log(err)
          }
        )
      })
      .catch((err) => {
        console.log(err)
      })
  })
}

// render new password page
exports.getNewPasswordPage = (req, res) => {
  const { token } = req.params
  console.log(token)
  User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let errorMsg = req.flash("error")
      if (errorMsg.length > 0) {
        errorMsg = errorMsg[0]
      } else {
        errorMsg = null
      }
      res.render("auth/new-password", {
        title: "Change password",
        errorMsg,
        resetToken: token,
        user_id: user._id.toString(),
      })
    })
    .catch((err) => console.log(err))
}

exports.changeNewPassword = (req, res) => {
  const { password, confirm_password, user_id, resetToken } = req.body
  let resetUser
  User.findOne({
    resetToken: resetToken,
    tokenExpiration: { $gt: Date.now() },
    _id: user_id,
  })
    .then((user) => {
      if (password === confirm_password) {
        resetUser = user
        return bcrypt.hash(password, 10)
      }
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined
      resetUser.tokenExpiration = undefined
      return resetUser.save()
    })
    .then(() => {
      res.redirect("/login")
    })
    .catch((err) => console.log(err))
}
