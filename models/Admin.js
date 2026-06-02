const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
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
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
