const express = require("express");
const path = require("path");
const session = require("express-session");
const loadEnv = require("./config/loadEnv");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const employeeProfileRoutes = require("./routes/employeeProfileRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

loadEnv();

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 2
    }
  })
);

app.use((req, res, next) => {
  res.locals.currentUser = req.session.admin || null;
  res.locals.successMessage = req.session.successMessage || null;
  res.locals.errorMessage = req.session.errorMessage || null;
  delete req.session.successMessage;
  delete req.session.errorMessage;
  next();
});

app.use("/", authRoutes);
app.use("/", dashboardRoutes);
app.use("/", paymentRoutes);
app.use("/employee", employeeProfileRoutes);
app.use("/employees", employeeRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`\nServer running — open in browser:`);
      console.log(`  http://localhost:${PORT}`);
      console.log(`  http://127.0.0.1:${PORT}\n`);
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `\nPort ${PORT} is already in use. Stop the other app or set PORT=5001 in .env\n`
        );
      } else {
        console.error("\nServer failed to start:", error.message);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Application startup failed.");
    process.exit(1);
  }
};

startServer();
