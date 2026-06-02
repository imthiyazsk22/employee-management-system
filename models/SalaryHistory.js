const mongoose = require("mongoose");

const salaryHistorySchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },
    previousSalary: {
      type: Number,
      required: true
    },
    newSalary: {
      type: Number,
      required: true
    },
    hikePercentage: {
      type: Number,
      default: 0
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    changedBy: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SalaryHistory", salaryHistorySchema);
