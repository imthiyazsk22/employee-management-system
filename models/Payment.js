const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    employeeId: {
      type: String,
      required: true,
      trim: true
    },
    employeeRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    employeeName: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid"
    },
    paidAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
