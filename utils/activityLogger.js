const ActivityLog = require("../models/ActivityLog");

const logActivity = async (action, employeeId = null, details = "") => {
  try {
    await ActivityLog.create({
      action,
      employee: employeeId,
      details
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};

module.exports = { logActivity };
