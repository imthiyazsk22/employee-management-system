# Employee Salary and Hike Management System

Full-stack MVC web application for employee records, salary updates, hikes, and salary history tracking.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- EJS templates
- Bootstrap 5
- Express Session authentication

## Features

- Admin login/logout with protected routes
- Dashboard with employee count, active count, and payroll summary
- Employee CRUD operations
- Employee search (name, employee ID, email, department)
- Salary update management
- Hike management (percentage-based)
- Salary history tracking for each salary change
- Responsive user interface

## Project Structure

```text
.
├── app.js
├── package.json
├── .env.example
├── config/
│   └── db.js
├── controllers/
│   ├── authController.js
│   ├── dashboardController.js
│   └── employeeController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/
│   ├── Admin.js
│   ├── Employee.js
│   └── SalaryHistory.js
├── routes/
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   └── employeeRoutes.js
├── public/
│   └── css/
│       └── styles.css
└── views/
    ├── auth/
    ├── dashboard/
    ├── employees/
    └── partials/
```

## Setup Instructions

### 1) Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB running locally or remotely

### 2) Install dependencies

```bash
npm install
```

### 3) Configure environment variables

Create a `.env` file in project root (copy from `.env.example`):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/employee_salary_hike_db
SESSION_SECRET=replace-with-a-strong-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Notes:
- If `MONGO_URI` is omitted, app falls back to `mongodb://127.0.0.1:27017/employee_salary_hike_db`.
- Default admin user is auto-created on first login page load if it does not exist.

### 4) Start application

Production mode:

```bash
npm start
```

Development mode:

```bash
npm run dev
```

### 5) Open in browser

- [http://localhost:5000](http://localhost:5000)

## Route Map

### Auth Routes

- `GET /` - Login page
- `POST /login` - Login admin
- `GET /logout` - Logout admin

### Dashboard Route

- `GET /dashboard` - Dashboard (protected)

### Employee Routes (all protected)

- `GET /employees` - Employee list + search
- `GET /employees/new` - Add employee form
- `POST /employees` - Create employee
- `GET /employees/:id` - Employee details + salary history
- `GET /employees/:id/edit` - Edit employee form
- `POST /employees/:id/update` - Update employee
- `POST /employees/:id/delete` - Delete employee
- `POST /employees/:id/salary` - Update salary
- `POST /employees/:id/hike` - Apply hike

## Validation and Error Handling

- Required field checks in controllers
- Numeric validation for salary and hike
- MongoDB uniqueness checks for employee ID and email
- ObjectId validation before DB operations on employee-specific routes
- Global 404 and server error handlers
