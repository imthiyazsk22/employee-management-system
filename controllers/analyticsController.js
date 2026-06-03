const Employee = require("../models/Employee");
const SalaryHistory = require("../models/SalaryHistory");
const Payment = require("../models/Payment");
const { DEPARTMENTS } = require("../utils/constants");

const salaryExpenses = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ currentSalary: -1 });
    const totalExpense = employees.reduce((sum, e) => sum + (e.currentSalary || 0), 0);
    const paidTotal = employees
      .filter((e) => e.paymentStatus === "Paid")
      .reduce((sum, e) => sum + (e.currentSalary || 0), 0);
    const pendingTotal = totalExpense - paidTotal;

    const byDepartment = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          totalSalary: { $sum: "$currentSalary" },
          count: { $sum: 1 },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] }
          }
        }
      },
      { $sort: { totalSalary: -1 } }
    ]);

    res.render("analytics/salary-expenses", {
      title: "Salary Expenses",
      employees,
      totalExpense,
      paidTotal,
      pendingTotal,
      byDepartment
    });
  } catch (error) {
    next(error);
  }
};

const salaryAnalysis = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ currentSalary: -1 });
    const count = employees.length;
    const total = employees.reduce((s, e) => s + e.currentSalary, 0);
    const average = count > 0 ? total / count : 0;
    const highest = employees[0] || null;
    const lowest = employees[count - 1] || null;

    const deptStats = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          avgSalary: { $avg: "$currentSalary" },
          maxSalary: { $max: "$currentSalary" },
          minSalary: { $min: "$currentSalary" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgSalary: -1 } }
    ]);

    const salaryRanges = [
      { label: "Below ₹30K", min: 0, max: 30000, count: 0 },
      { label: "₹30K – ₹60K", min: 30000, max: 60000, count: 0 },
      { label: "₹60K – ₹1L", min: 60000, max: 100000, count: 0 },
      { label: "Above ₹1L", min: 100000, max: Infinity, count: 0 }
    ];

    employees.forEach((e) => {
      const s = e.currentSalary;
      if (s < 30000) salaryRanges[0].count++;
      else if (s < 60000) salaryRanges[1].count++;
      else if (s < 100000) salaryRanges[2].count++;
      else salaryRanges[3].count++;
    });

    res.render("analytics/salary-analysis", {
      title: "Salary Analysis",
      count,
      total,
      average,
      highest,
      lowest,
      deptStats,
      salaryRanges
    });
  } catch (error) {
    next(error);
  }
};

const hikeDetails = async (req, res, next) => {
  try {
    const hikeRecords = await SalaryHistory.find({ hikePercentage: { $gt: 0 } })
      .populate("employee", "fullName employeeId department designation currentSalary")
      .sort({ createdAt: -1 });

    const uniqueEmployees = new Map();
    hikeRecords.forEach((r) => {
      if (r.employee) uniqueEmployees.set(r.employee._id.toString(), r.employee);
    });

    res.render("analytics/hike-details", {
      title: "Active Hikes",
      hikeRecords,
      employeesWithHikes: Array.from(uniqueEmployees.values()),
      totalHikes: hikeRecords.length
    });
  } catch (error) {
    next(error);
  }
};

const departmentsPage = async (req, res, next) => {
  try {
    const stats = await Employee.aggregate([
      {
        $group: {
          _id: "$department",
          employeeCount: { $sum: 1 },
          totalSalary: { $sum: "$currentSalary" },
          avgSalary: { $avg: "$currentSalary" },
          paidCount: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "Paid"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const deptMap = Object.fromEntries(stats.map((s) => [s._id, s]));
    const allDepts = DEPARTMENTS.map((name) => ({
      name,
      employeeCount: deptMap[name]?.employeeCount || 0,
      totalSalary: deptMap[name]?.totalSalary || 0,
      avgSalary: deptMap[name]?.avgSalary || 0,
      paidCount: deptMap[name]?.paidCount || 0
    }));

    res.render("analytics/departments", {
      title: "Departments",
      departments: allDepts
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  salaryExpenses,
  salaryAnalysis,
  hikeDetails,
  departmentsPage
};
