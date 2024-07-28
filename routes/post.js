const express = require("express")

const postController = require("../controllers/posts")
const router = express.Router()

router.get("/", postController.getPosts)
router.get("/post/:postId", postController.getPost)

module.exports = router
