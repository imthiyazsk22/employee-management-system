const express = require("express");
const router = express.Router();
const { dashboard } = require("../controllers/dashboardController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/dashboard", isAuthenticated, dashboard);

module.exports = router;
