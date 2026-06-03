const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const isPaymentApi =
    req.path.startsWith("/pay-salary") ||
    req.get("Accept")?.includes("application/json");

  if (isPaymentApi && req.method === "POST") {
    return res.status(500).json({
      message: err.message || "Something went wrong."
    });
  }

  res.status(500).render("partials/error", {
    title: "Server Error",
    message: err.message || "Something went wrong."
  });
};

module.exports = errorHandler;
