const express = require("express")

const router = express.Router()
const postController = require("../controllers/post")
const userController = require("../controllers/user")
const { body } = require("express-validator")

router.get("/create-post", postController.renderCreatePage)

router.post(
  "/",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title must have at least 1 character."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description must have at least 1 character"),
  ],
  postController.createPost
)

router.get("/edit/:postId", postController.getEditPost)

router.post(
  "/edit-post",
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Title must have at least 1 character."),
    body("description")
      .trim()
      .notEmpty()
      .withMessage("Description must have at least 1 character"),
  ],
  postController.updatePost
)

router.post("/delete/:postId", postController.deletePost)

router.get("/profile", userController.getProfile)

router.get("/username", userController.renderUsernamePage)

router.post(
  "/setusername",
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters."),
  userController.setUsername
)

router.get("/premium", userController.renderPremiumPage)

module.exports = router
