const express = require("express")
const router = express.Router()

const authController = require("../controllers/auth")

// render register page
router.get("/register", authController.getRegisterPage)

// handle register
router.post("/register", authController.registerAccount)

// render login page
router.get("/login", authController.getLoginPage)

// handle login
router.post("/login", authController.postLoginData)

// handle logout
router.post("/logout", authController.postLogoutData)

// render reset password page
router.get("/reset-password", authController.getResetPage)

// render feedback page
router.get("/feedback", authController.getFeedbackPage)

// send reset password link
router.post("/reset", authController.resetPasswordLink)

// render password changing page
router.get("/reset-password/:token", authController.getNewPasswordPage)

// change new password
router.post("/change-new-password", authController.changeNewPassword)

module.exports = router
