const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

/**
 * Load .env from project root first, then models/.env (legacy location).
 */
const loadEnv = () => {
  const rootEnv = path.join(__dirname, "..", ".env");
  const legacyEnv = path.join(__dirname, "..", "models", ".env");

  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
    return rootEnv;
  }

  if (fs.existsSync(legacyEnv)) {
    dotenv.config({ path: legacyEnv });
    console.warn(
      "[config] Loaded models/.env — move this file to the project root as .env for best results."
    );
    return legacyEnv;
  }

  dotenv.config();
  console.warn(
    "[config] No .env file found. Copy .env.example to .env in the project root."
  );
  return null;
};

module.exports = loadEnv;
