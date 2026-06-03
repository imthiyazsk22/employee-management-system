/** Stable numeric seed from employee id (for legacy records without metrics). */
const seedFromId = (employeeId = "") => {
  let n = 0;
  for (let i = 0; i < employeeId.length; i += 1) {
    n += employeeId.charCodeAt(i);
  }
  return n;
};

const getAttendance = (employee) => {
  let present = employee.presentDays;
  let absent = employee.absentDays;

  if (present == null && absent == null) {
    const seed = seedFromId(employee.employeeId);
    present = 18 + (seed % 8);
    absent = 1 + (seed % 4);
  } else {
    present = Math.max(0, Number(present) || 0);
    absent = Math.max(0, Number(absent) || 0);
  }

  const total = present + absent;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return { present, absent, total, percentage };
};

const getTasks = (employee) => {
  let completed = employee.tasksCompleted;
  let pending = employee.tasksPending;

  if (completed == null && pending == null) {
    const seed = seedFromId(employee.employeeId);
    completed = 5 + (seed % 12);
    pending = 1 + (seed % 6);
  } else {
    completed = Math.max(0, Number(completed) || 0);
    pending = Math.max(0, Number(pending) || 0);
  }

  const total = completed + pending;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 100;

  return { completed, pending, total, completionRate };
};

/** 1–5 stars from attendance (50%) + task completion (50%). */
const getPerformanceRating = (attendancePct, taskCompletionRate) => {
  const score = attendancePct * 0.5 + taskCompletionRate * 0.5;
  if (score >= 92) return 5;
  if (score >= 78) return 4;
  if (score >= 62) return 3;
  if (score >= 45) return 2;
  return 1;
};

const buildProfileMetrics = (employee) => {
  const attendance = getAttendance(employee);
  const tasks = getTasks(employee);
  const performanceRating = getPerformanceRating(
    attendance.percentage,
    tasks.completionRate
  );

  return { attendance, tasks, performanceRating };
};

module.exports = {
  buildProfileMetrics,
  getAttendance,
  getTasks,
  getPerformanceRating
};
