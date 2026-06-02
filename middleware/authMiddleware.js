const isAuthenticated = (req, res, next) => {
  if (!req.session.admin) {
    req.session.errorMessage = "Please login to continue.";
    return res.redirect("/");
  }
  next();
};

module.exports = { isAuthenticated };
