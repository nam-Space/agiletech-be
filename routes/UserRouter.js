const express = require("express");
const { loginUser, registerUser, refreshToken, logoutUser, getAccountUser } = require("../controllers/userController");
const router = express.Router();


router.post("/login", loginUser);

router.post("/register", registerUser);

router.post("/refreshToken", refreshToken);

router.post("/logout", logoutUser);

router.post("/account", getAccountUser);

module.exports = router;
