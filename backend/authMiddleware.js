import jwt from "jsonwebtoken";

const authenticateToken = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Access Denied! No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT Verification Failed:", err.message);
    return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
  }
};

export default authenticateToken;
