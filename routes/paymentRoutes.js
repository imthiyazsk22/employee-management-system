const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const { paySalary, paymentHistory } = require("../controllers/paymentController");

router.get("/payment-history", isAuthenticated, paymentHistory);
router.post("/pay-salary/:id", isAuthenticated, paySalary);

module.exports = router;
