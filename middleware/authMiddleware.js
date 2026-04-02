const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  authMiddleware(req, res, () => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ success: false, message: "Access denied: insufficient role" });
    next();
  });
};

module.exports = { authMiddleware, requireRole };
