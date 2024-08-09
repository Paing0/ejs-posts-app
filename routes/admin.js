const express = require("express")

const router = express.Router()
const postController = require("../controllers/post")
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

module.exports = router
