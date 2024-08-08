const User = require("../models/user")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const dotenv = require("dotenv").config
const { validationResult } = require("express-validator")

// setup for nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_MAIL,
    pass: process.env.MAIL_PASSWORD,
  },
})

// render register page
exports.getRegisterPage = (req, res) => {
  let errorMsg = req.flash("error") // assign "error" from flash
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0] // if error exist assign the  message to errorMsg
  } else {
    errorMsg = null
  }
  res.render("auth/register", {
    title: "Register",
   errorMsg,
    oldFormData: { email: "", password: "" },
  })
}

// handle register
exports.registerAccount = (req, res) => {
  const { email, password } = req.body
  // extracts the validation errors from the request object.
 // 'validationResult' is a method from 'express-validator' that collects all errors generated during the validation process.
  const errors = validationResult(req)
  // Checks if there are any validation errors.
  if (!errors.isEmpty()) {
    // If there are errors, respond with a 422 status
    return res.status(422).render("auth/register", {
      title: "Register",

      // Extracts the first error message from the array of validation errors and passes it to the view.
      // 'errors.array()' converts the validation errors to an array.
      // '[0]' accesses the first error object in the array.
      // '.msg' retrieves the message associated with that error, which will be displayed on the registration page.
      errorMsg: errors.array()[0].msg,
      oldFormData: { email, password },
    })
  }
  // hash the password using bcrypt with salt 10
  bcrypt.hash(password, 10).then((hashedPassword) => {
    // create a new user with the provided email and hashedPassword
    return User.create({
      email,
      password: hashedPassword,
    }).then(() => {
      res.redirect("/login")
      // send mail to that email
      transporter
        .sendMail({
          from: process.env.SENDER_MAIL,
          to: email,
          subject: "Register Successfully",
          html: `<h1>Registered account successfully</h1><p>You have created an account using ${email} to our site.</p>`,
        })
        .catch((err) => {
          console.log(err)
        })
    })
  })
}

// render login page
exports.getLoginPage = (req, res) => {
  let errorMsg = req.flash("error") // assign "error" from flash
  if (errorMsg.length > 0) {
    errorMsg = errorMsg[0] // if error exist assign the message to errorMsg
  } else {
    errorMsg = null
  }
  res.render("auth/login", {
    title: "Login",
    errorMsg,
    oldFormData: { email: "", password: "" },
  })
}

// handle login
exports.postLoginData = (req, res) => {
  const { email, password } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(422).render("auth/login", {
      title: "Login",
      errorMsg: errors.array()[0].msg,
      oldFormData: { email, password },
    })
  }
  User.findOne({ email }) // find a user in db with the email from req.body
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          title: "Login",
          errorMsg: "Please check your email and password again",
          oldFormData: { email, password },
        })
      }
      // compare the password from req.body and the password in db
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true
            req.session.userInfo = user
            req.flash("success", "Login successful.")
            return req.session.save((err) => {
              res.redirect("/")
              console.log(err)
            })
          }
          res.status(422).render("auth/login", {
            title: "Login",
            errorMsg: "Please check your email and password again",
            oldFormData: { email, password },
          })
        })
        .catch((err) => console.log(err))
    })
    .catch((err) => console.log(err))
}

// handle logout
exports.postLogoutData = (req, res) => {
  req.session.destroy(() => {
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
  res.render("auth/reset", {
    title: "Reset Password",
    errorMsg,
    oldFormData: { email: "" },
  })
}

// render feedback page
exports.getFeedbackPage = (req, res) => {
  res.render("auth/feedback", { title: "Success" })
}

// send reset password link
exports.resetPasswordLink = (req, res) => {
  const { email } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/reset", {
      title: "Reset Password",
      errorMsg: errors.array()[0].msg,
      oldFormData: { email },
    })
  }
  // generate a buffer containing 32 random bytes
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err)
      return res.redirect("/reset-password")
    }
    // convert the buffer toString as hex
    const token = buffer.toString("hex")
    User.findOne({ email }) // find email in db from req.body
      .then((user) => {
        if (!user) {
          return res.status(422).render("auth/reset", {
            title: "Reset Password",
            errorMsg: "Email doesn't exist, please check your email again",
            oldFormData: { email },
          })
        }
        // else
        user.resetToken = token
        user.tokenExpiration = Date.now() + 1800000 // 30 mins
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
  // check if the resetToken from db equals to the token from req.params
  // check if tokenExpiration is greater than the current date and time
  User.findOne({ resetToken: token, tokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let errorMsg = req.flash("error")
      if (errorMsg.length > 0) {
        errorMsg = errorMsg[0]
      } else {
        errorMsg = null
      }
      // render new-password page
      res.render("auth/new-password", {
        title: "Change password",
        errorMsg,
        resetToken: token,
        user_id: user._id,
        oldFormData: { password: "", confirm_password: "" },
      })
    })
    .catch((err) => console.log(err))
}

exports.changeNewPassword = (req, res) => {
  const { password, confirm_password, user_id, resetToken } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/new-password", {
      title: "Change password",
      errorMsg: errors.array()[0].msg,
      resetToken,
      user_id,
      oldFormData: { password, confirm_password },
    })
  }
  let resetUser
  // check if the resetToken from db equals to the token from req.body
  // check if the tokenExpiration is in the future (i.e., token is still valid)
  // check the id from db is equals to the user_id from req.body
  User.findOne({
    resetToken: resetToken,
    tokenExpiration: { $gt: Date.now() },
    _id: user_id,
  })
    .then((user) => {
      resetUser = user // store the user document in resetUser variable
      return bcrypt.hash(password, 10) // hash the new password with bcrypt, using a salt round of 10
      // if passwords do not match, skip hashing and proceed to the next promise chain
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword
      resetUser.resetToken = undefined // remove the resetToken
      resetUser.tokenExpiration = undefined // remove the tokenExpiration
      return resetUser.save()
    })
    .then(() => {
      return res.redirect("/login")
    })
    .catch((err) => console.log(err))
}
