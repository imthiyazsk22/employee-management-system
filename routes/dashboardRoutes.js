const express = require("express");
const router = express.Router();
const { dashboard } = require("../controllers/dashboardController");
const {
  salaryExpenses,
  salaryAnalysis,
  hikeDetails,
  departmentsPage
} = require("../controllers/analyticsController");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/dashboard", isAuthenticated, dashboard);
router.get("/salary-expenses", isAuthenticated, salaryExpenses);
router.get("/salary-analysis", isAuthenticated, salaryAnalysis);
router.get("/hike-details", isAuthenticated, hikeDetails);
router.get("/departments", isAuthenticated, departmentsPage);

module.exports = router;
