const express = require("express");
const { getAllTags, getTagById, createNewTag, updateTagById, deleteTagById } = require("../controllers/tagController");
const router = express.Router();

router.get("/", getAllTags);
router.get("/:id", getTagById);
router.post("/", createNewTag);
router.patch("/:id", updateTagById);
router.delete("/:id", deleteTagById);

module.exports = router;
