const express = require("express");
const router = express.Router();
const { loginPage, login, logout } = require("../controllers/authController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/", loginPage);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);

module.exports = router;
