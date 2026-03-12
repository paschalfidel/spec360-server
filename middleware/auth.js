// server/middleware/auth.js
// JWT verification middleware — protects admin routes
// Used by: POST /api/products, DELETE /api/products/:id
import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // Token must be sent as: Authorization: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // extract token after "Bearer "

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id: user._id, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;