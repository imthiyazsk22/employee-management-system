const Employee = require("../models/Employee");
const SalaryHistory = require("../models/SalaryHistory");
const mongoose = require("mongoose");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const listEmployees = async (req, res, next) => {
  try {
    const search = req.query.search ? req.query.search.trim() : "";
    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: "i" } },
            { employeeId: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { department: { $regex: search, $options: "i" } }
          ]
        }
      : {};

    const employees = await Employee.find(query).sort({ createdAt: -1 });

    res.render("employees/index", {
      title: "Employees",
      employees,
      search
    });
  } catch (error) {
    next(error);
  }
};

const addEmployeeForm = (req, res) => {
  res.render("employees/form", {
    title: "Add Employee",
    formTitle: "Add Employee",
    employee: {},
    action: "/employees"
  });
};

const createEmployee = async (req, res, next) => {
  try {
    const {
      employeeId,
      fullName,
      email,
      department,
      designation,
      joiningDate,
      currentSalary,
      status
    } = req.body;

    if (
      !employeeId ||
      !fullName ||
      !email ||
      !department ||
      !designation ||
      !joiningDate ||
      !currentSalary
    ) {
      req.session.errorMessage = "All required fields must be filled.";
      return res.redirect("/employees/new");
    }

    const salaryValue = Number(currentSalary);
    if (Number.isNaN(salaryValue) || salaryValue < 0) {
      req.session.errorMessage = "Salary must be a valid non-negative number.";
      return res.redirect("/employees/new");
    }

    await Employee.create({
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      department: department.trim(),
      designation: designation.trim(),
      joiningDate,
      currentSalary: salaryValue,
      status
    });

    req.session.successMessage = "Employee created successfully.";
    return res.redirect("/employees");
  } catch (error) {
    if (error.code === 11000) {
      req.session.errorMessage = "Employee ID or Email already exists.";
      return res.redirect("/employees/new");
    }
    next(error);
  }
};

const editEmployeeForm = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    res.render("employees/form", {
      title: "Edit Employee",
      formTitle: "Edit Employee",
      employee,
      action: `/employees/${employee._id}/update`
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const {
      employeeId,
      fullName,
      email,
      department,
      designation,
      joiningDate,
      status
    } = req.body;

    if (
      !employeeId ||
      !fullName ||
      !email ||
      !department ||
      !designation ||
      !joiningDate
    ) {
      req.session.errorMessage = "All required fields must be filled.";
      return res.redirect(`/employees/${req.params.id}/edit`);
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        employeeId: employeeId.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        department: department.trim(),
        designation: designation.trim(),
        joiningDate,
        status
      },
      { runValidators: true, new: true }
    );

    if (!updatedEmployee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    req.session.successMessage = "Employee details updated.";
    return res.redirect("/employees");
  } catch (error) {
    if (error.code === 11000) {
      req.session.errorMessage = "Employee ID or Email already exists.";
      return res.redirect(`/employees/${req.params.id}/edit`);
    }
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const deletedEmployee = await Employee.findByIdAndDelete(req.params.id);
    if (!deletedEmployee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    await SalaryHistory.deleteMany({ employee: req.params.id });
    req.session.successMessage = "Employee removed.";
    return res.redirect("/employees");
  } catch (error) {
    next(error);
  }
};

const employeeDetails = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    const salaryHistory = await SalaryHistory.find({ employee: employee._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.render("employees/details", {
      title: "Employee Details",
      employee,
      salaryHistory
    });
  } catch (error) {
    next(error);
  }
};

const updateSalary = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const { newSalary, reason } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    const salaryValue = Number(newSalary);
    if (Number.isNaN(salaryValue) || salaryValue < 0) {
      req.session.errorMessage = "New salary must be a valid non-negative number.";
      return res.redirect(`/employees/${employee._id}`);
    }

    const previousSalary = employee.currentSalary;
    employee.currentSalary = salaryValue;
    await employee.save();

    await SalaryHistory.create({
      employee: employee._id,
      previousSalary,
      newSalary: salaryValue,
      hikePercentage:
        previousSalary > 0
          ? Number((((salaryValue - previousSalary) / previousSalary) * 100).toFixed(2))
          : 0,
      reason: reason ? reason.trim() : "Manual salary update",
      changedBy: req.session.admin.username
    });

    req.session.successMessage = "Salary updated successfully.";
    return res.redirect(`/employees/${employee._id}`);
  } catch (error) {
    next(error);
  }
};

const applyHike = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      req.session.errorMessage = "Invalid employee ID.";
      return res.redirect("/employees");
    }

    const { hikePercentage, reason } = req.body;
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      req.session.errorMessage = "Employee not found.";
      return res.redirect("/employees");
    }

    const hike = Number(hikePercentage);
    if (Number.isNaN(hike) || hike <= 0) {
      req.session.errorMessage = "Hike percentage must be a valid number greater than 0.";
      return res.redirect(`/employees/${employee._id}`);
    }

    const previousSalary = employee.currentSalary;
    const newSalary = Number((previousSalary + previousSalary * (hike / 100)).toFixed(2));
    employee.currentSalary = newSalary;
    await employee.save();

    await SalaryHistory.create({
      employee: employee._id,
      previousSalary,
      newSalary,
      hikePercentage: hike,
      reason: reason ? reason.trim() : "Hike applied",
      changedBy: req.session.admin.username
    });

    req.session.successMessage = "Hike applied successfully.";
    return res.redirect(`/employees/${employee._id}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listEmployees,
  addEmployeeForm,
  createEmployee,
  editEmployeeForm,
  updateEmployee,
  deleteEmployee,
  employeeDetails,
  updateSalary,
  applyHike
};
