const Employee = require("../models/Employee");
const SalaryHistory = require("../models/SalaryHistory");
const Payment = require("../models/Payment");
const ActivityLog = require("../models/ActivityLog");

const dashboard = async (req, res, next) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const totalPayrollData = await Employee.aggregate([
      { $group: { _id: null, total: { $sum: "$currentSalary" } } }
    ]);

    const employeeSalaryData = await Employee.find(
      {},
      { fullName: 1, currentSalary: 1, department: 1 }
    ).sort({ fullName: 1 });

    const departmentCounts = await Employee.aggregate([
      { $group: { _id: "$department", count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);

    const employeesWithHikeData = await SalaryHistory.aggregate([
      { $match: { hikePercentage: { $gt: 0 } } },
      { $group: { _id: "$employee" } },
      { $count: "count" }
    ]);

    const recentSalaryChanges = await SalaryHistory.find()
      .populate("employee", "fullName employeeId")
      .sort({ createdAt: -1 })
      .limit(5);

    const pendingPayments = await Employee.countDocuments({
      $or: [{ paymentStatus: "Pending" }, { paymentStatus: { $exists: false } }]
    });
    const paidPayments = await Employee.countDocuments({ paymentStatus: "Paid" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paidThisMonth = await Payment.aggregate([
      { $match: { paidAt: { $gte: startOfMonth }, status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const avgSalaryByDept = await Employee.aggregate([
      { $group: { _id: "$department", avg: { $avg: "$currentSalary" } } },
      { $sort: { avg: -1 } }
    ]);

    const highestPaid = await Employee.findOne().sort({ currentSalary: -1 }).select(
      "fullName currentSalary department"
    );

    const recentActivities = await ActivityLog.find()
      .populate("employee", "fullName employeeId")
      .sort({ createdAt: -1 })
      .limit(8);

    const totalPayroll = totalPayrollData[0]?.total || 0;
    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    res.render("dashboard/index", {
      title: "Dashboard",
      stats: {
        totalEmployees,
        totalSalaryExpense: totalPayroll,
        averageSalary,
        employeesWithActiveHikes: employeesWithHikeData[0]?.count || 0,
        pendingPayments,
        paidPayments,
        paidThisMonth: paidThisMonth[0]?.total || 0
      },
      analytics: {
        avgSalaryByDept,
        highestPaid,
        departmentCounts
      },
      recentSalaryChanges,
      recentActivities,
      employeeSalaryData,
      departmentCounts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { dashboard };
