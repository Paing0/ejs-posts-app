const User = require("../models/user")
const bcrypt = require("bcrypt")

// render register page
exports.getRegisterPage = (req, res) => {
  res.render("auth/register", { title: "Register" })
}

// handle register
exports.registerAccount = (req, res) => {
  const { email, password } = req.body
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.redirect("/register")
      }
      return bcrypt.hash(password, 10).then((hashedPassword) => {
        return User.create({
          email,
          password: hashedPassword,
        }).then(() => res.redirect("/login"))
      })
    })
    .catch((err) => console.log(err))
}

// render login page
exports.getLoginPage = (req, res) => {
  res.render("auth/login", { title: "Login" })
}

// handle login
exports.postLoginData = (req, res) => {
  const { email, password } = req.body
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login")
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true
            req.session.userInfo = user
            return req.session.save((err) => {
              console.log(err)
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
