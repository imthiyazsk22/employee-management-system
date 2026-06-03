const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const { employeeProfile } = require("../controllers/employeeController");

router.get("/:id", isAuthenticated, employeeProfile);

module.exports = router;
