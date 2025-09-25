import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function authenticateToken(req, res, next) {
  let token = null;

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7); // strip "Bearer "
    }
  }

  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.userID };
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
