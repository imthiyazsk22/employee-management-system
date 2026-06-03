const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Payment = require("../models/Payment");
const { logActivity } = require("../utils/activityLogger");

const generateTransactionId = () => `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

const paySalary = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid employee ID." });
    }

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    if (employee.paymentStatus === "Paid") {
      return res.status(400).json({ message: "Salary already paid for this employee." });
    }

    const amount = Number(employee.currentSalary);
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid salary amount." });
    }

    const transactionId = generateTransactionId();
    const paidAt = new Date();

    employee.paymentStatus = "Paid";
    employee.paymentDate = paidAt;
    employee.transactionId = transactionId;
    await employee.save();

    await Payment.create({
      transactionId,
      employeeId: employee.employeeId,
      employeeRef: employee._id,
      employeeName: employee.fullName,
      department: employee.department,
      amount,
      status: "Paid",
      paidAt
    });

    await logActivity(
      "Salary Paid",
      employee._id,
      `₹${amount.toLocaleString()} — ${transactionId}`
    );

    req.session.successMessage = `Payment successful! Transaction: ${transactionId}`;

    return res.json({
      success: true,
      message: "Payment Successful",
      transactionId,
      redirect: `/employee/${employee._id}`
    });
  } catch (error) {
    next(error);
  }
};

const paymentHistory = async (req, res, next) => {
  try {
    const { employee, department, status } = req.query;
    const query = {};

    if (employee && employee.trim()) {
      query.employeeName = { $regex: employee.trim(), $options: "i" };
    }
    if (department && department.trim()) {
      query.department = department.trim();
    }
    if (status && ["Paid", "Pending"].includes(status)) {
      query.status = status;
    }

    const payments = await Payment.find(query).sort({ paidAt: -1 });
    const departments = await Payment.distinct("department");

    res.render("payments/history", {
      title: "Payment History",
      payments,
      departments,
      filters: { employee: employee || "", department: department || "", status: status || "" }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  paySalary,
  paymentHistory
};
