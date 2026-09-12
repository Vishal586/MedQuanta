// Use after `protect` — restricts a route to specific roles.
// Example: router.post("/", protect, restrictTo("patient"), handler)
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You don't have permission to do this" });
    }
    next();
  };
}

module.exports = { restrictTo };
