const express = require("express")
const router = express.Router()
const { body } = require("express-validator")
const User = require("../models/user")

const authController = require("../controllers/auth")

// render register page
router.get("/register", authController.getRegisterPage)

// handle register
router.post(
  "/register",
  body("email")
    // validates that the input is a valid email format
    .isEmail()
    // if the validation fails, it sends the specified error message
    .withMessage("Please enter an valid email address")
    // custom validation logic for the email field
    .custom((value, { req }) => {
      // queries the database to check if a user with the provided email already exists
      return User.findOne({ email: value }).then((user) => {
        if (user) {
          // if a user is found, it rejects the promise with an error message
          return Promise.reject("Email already exists")
        }
        // if no user is found, the promise resolves, and the validation passes
      })
      // if the email validation passes (both format and uniqueness), the request proceeds to the next middleware
    }),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters"),
  authController.registerAccount
)

// render login page
router.get("/login", authController.getLoginPage)

// handle login
router.post(
  "/login",
  body("email").isEmail().withMessage("Please enter an valid email address"),
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters"),
  authController.postLoginData
)

// handle logout
router.post("/logout", authController.postLogoutData)

// render reset password page
router.get("/reset-password", authController.getResetPage)

// render feedback page
router.get("/feedback", authController.getFeedbackPage)

// send reset password link
router.post(
  "/reset",
  body("email").isEmail().withMessage("Please enter an valid email address"),
  authController.resetPasswordLink
)

// render password changing page
router.get("/reset-password/:token", authController.getNewPasswordPage)

// change new password
router.post(
  "/change-new-password",
  body("password")
    .isLength({ min: 4 })
    .trim()
    .withMessage("Password must have at least 4 characters"),
  body("confirm_password")
    .trim()
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password must be the same")
      }
      return true
    }),
  authController.changeNewPassword
)

module.exports = router
