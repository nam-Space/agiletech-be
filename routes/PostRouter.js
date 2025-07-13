const express = require("express");
const { getAllPosts, getPostById, createNewPost, updatePostById, deletePostById } = require("../controllers/postController");
const { verifyToken } = require("../utils/auth");
const router = express.Router();

router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.post("/", verifyToken, createNewPost);
router.patch("/:id", verifyToken, updatePostById);
router.delete("/:id", verifyToken, deletePostById);

module.exports = router;
