const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");
const employeeController = require("../controllers/employeeController");

router.get("/", isAuthenticated, employeeController.listEmployees);
router.get("/new", isAuthenticated, employeeController.addEmployeeForm);
router.post("/", isAuthenticated, employeeController.createEmployee);
router.get("/:id", isAuthenticated, employeeController.employeeDetails);
router.get("/:id/edit", isAuthenticated, employeeController.editEmployeeForm);
router.post("/:id/update", isAuthenticated, employeeController.updateEmployee);
router.post("/:id/delete", isAuthenticated, employeeController.deleteEmployee);
router.post("/:id/salary", isAuthenticated, employeeController.updateSalary);
router.post("/:id/hike", isAuthenticated, employeeController.applyHike);

module.exports = router;
