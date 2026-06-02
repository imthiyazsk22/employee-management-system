const notFound = (req, res) => {
  res.status(404).render("partials/error", {
    title: "Page Not Found",
    message: "The page you are looking for does not exist."
  });
};

module.exports = notFound;
