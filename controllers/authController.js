const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");

const BCRYPT_SALT_ROUNDS = 10;
const BCRYPT_HASH_PREFIX = "$2";

const isBcryptHash = (value) =>
  typeof value === "string" && value.startsWith(BCRYPT_HASH_PREFIX);

const ensureDefaultAdmin = async () => {
  const username = process.env.ADMIN_USERNAME || "admin";
  const email = process.env.ADMIN_EMAIL || "admin@imsolutions.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const existing = await Admin.findOne({ $or: [{ username }, { email }] });
  if (!existing) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    await Admin.create({ username, email, password: hashedPassword });
    return;
  }

  if (!existing.email) {
    existing.email = email;
    await existing.save();
  }
};

const loginPage = async (req, res, next) => {
  try {
    if (req.session.admin) {
      return res.redirect("/dashboard");
    }
    await ensureDefaultAdmin();
    return res.render("auth/login", { title: "Admin Login" });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username ? username.trim() : "";

    if (!username || !password) {
      req.session.errorMessage = "Username and password are required.";
      return res.redirect("/");
    }

    const admin = await Admin.findOne({ username: normalizedUsername });
    if (!admin) {
      req.session.errorMessage = "Invalid login credentials.";
      return res.redirect("/");
    }

    let isValidPassword = false;
    const storedPassword = admin.password || "";

    if (isBcryptHash(storedPassword)) {
      isValidPassword = await bcrypt.compare(password, storedPassword);
    } else {
      // Backward-compatible migration from plaintext password to bcrypt hash.
      isValidPassword = storedPassword === password;
      if (isValidPassword) {
        admin.password = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        await admin.save();
      }
    }

    if (!isValidPassword) {
      req.session.errorMessage = "Invalid login credentials.";
      return res.redirect("/");
    }

    req.session.admin = {
      id: admin._id.toString(),
      username: admin.username
    };
    req.session.successMessage = "Login successful.";
    return res.redirect("/dashboard");
  } catch (error) {
    next(error);
  }
};

const logout = (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      return next(error);
    }
    res.redirect("/");
  });
};

module.exports = {
  loginPage,
  login,
  logout
};
