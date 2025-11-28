// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "liftyapp_secret_key_2024";

const verificarToken = (req, res, next) => {
  // 1) Cookie httpOnly
  const cookieToken = req.cookies?.token;

  // 2) Authorization: Bearer <token>
  const authHeader = req.headers["authorization"];
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = cookieToken || headerToken;
  if (!token) {
    return res.status(401).json({ message: "No hay token" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id_user: decoded.id_user,
      id: decoded.id_user,
      email: decoded.email,
      username: decoded.username,
      full_name: decoded.full_name,
      role: decoded.role,
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token no válido" });
  }
};

const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "No autenticado" });
    }
    if (!rolesPermitidos.includes(req.user.role)) {
      return res.status(403).json({ message: "No tienes permisos" });
    }
    next();
  };
};

module.exports = { verificarToken, verificarRol };
