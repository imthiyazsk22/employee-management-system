const Employee = require("../models/Employee");
const SalaryHistory = require("../models/SalaryHistory");

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

    const totalPayroll = totalPayrollData[0]?.total || 0;
    const averageSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

    res.render("dashboard/index", {
      title: "Dashboard",
      stats: {
        totalEmployees,
        totalSalaryExpense: totalPayroll,
        averageSalary,
        employeesWithActiveHikes: employeesWithHikeData[0]?.count || 0
      },
      recentSalaryChanges,
      employeeSalaryData,
      departmentCounts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { dashboard };
