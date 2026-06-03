/**
 * Quick pre-flight check: .env, MongoDB, and port availability.
 * Run: npm run check
 */
const net = require("net");
const path = require("path");
const loadEnv = require("../config/loadEnv");
const mongoose = require("mongoose");

loadEnv();

const PORT = Number(process.env.PORT) || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/employee_salary_hike_db";

const checkPort = () =>
  new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve({ ok: false, message: `Port ${PORT} is already in use (server may already be running).` });
      } else {
        resolve({ ok: false, message: err.message });
      }
    });
    server.once("listening", () => {
      server.close(() => resolve({ ok: true }));
    });
    server.listen(PORT, "127.0.0.1");
  });

const run = async () => {
  console.log("IM Solutions HR — setup check\n");

  const rootEnv = path.join(__dirname, "..", ".env");
  const legacyEnv = path.join(__dirname, "..", "models", ".env");
  if (require("fs").existsSync(rootEnv)) {
    console.log("✓ .env found at project root");
  } else if (require("fs").existsSync(legacyEnv)) {
    console.log("⚠ .env only in models/ — copy to project root as .env");
  } else {
    console.log("✗ No .env — copy .env.example to .env");
  }

  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("✓ MongoDB connected");
    await mongoose.disconnect();
  } catch (err) {
    console.log("✗ MongoDB:", err.message);
    console.log("  → Start MongoDB service, then run npm start again.");
    process.exit(1);
  }

  const portResult = await checkPort();
  if (portResult.ok) {
    console.log(`✓ Port ${PORT} is free`);
  } else {
    console.log(`⚠ ${portResult.message}`);
    console.log(`  → Try http://localhost:${PORT} in your browser.`);
  }

  console.log("\nNext: npm start");
  console.log(`Then open: http://localhost:${PORT}\n`);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
