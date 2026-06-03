const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      required: true,
      trim: true
    },
    joiningDate: {
      type: Date,
      required: true
    },
    currentSalary: {
      type: Number,
      required: true,
      min: 0
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending"
    },
    paymentDate: {
      type: Date,
      default: null
    },
    transactionId: {
      type: String,
      default: null,
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active"
    },
    presentDays: {
      type: Number,
      min: 0,
      default: null
    },
    absentDays: {
      type: Number,
      min: 0,
      default: null
    },
    tasksCompleted: {
      type: Number,
      min: 0,
      default: null
    },
    tasksPending: {
      type: Number,
      min: 0,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
