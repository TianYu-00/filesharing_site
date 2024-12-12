const isLoggedInChecker = (req, res, next) => {
  if (!req.userData) {
    return next({
      code: "NOT_LOGGED_IN",
      message: "User session expired",
    });
  }
  next();
};

module.exports = isLoggedInChecker;
