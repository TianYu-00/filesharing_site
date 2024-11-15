const checkAdminRole = (req, res, next) => {
  if (req.userData.role !== "admin") {
    return res.status(403).json({ success: false, msg: "Access denied." });
  }
  next();
};

module.exports = checkAdminRole;
