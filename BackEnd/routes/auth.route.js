// routes/auth.route.js
const express = require("express");
const passport = require("passport");
const { 
  register, 
  login, 
  googleCallback, 
  logout, 
  getProfile,
  getCurrentUser,
  verifyToken,
  checkEmailAvailability,
  checkUsernameAvailability,
} = require("../controllers/auth.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas públicas
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/logout", logout);

// Verificar disponibilidad (antes de registrarse)
router.get("/auth/check-email", checkEmailAvailability);
router.get("/auth/check-username", checkUsernameAvailability);

// Google OAuth
router.get(
  "/auth/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    prompt: "select_account", // Fuerza a mostrar el selector de cuentas de Google
    accessType: "online" // No mantiene sesión persistente
  })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  googleCallback
);

// Rutas protegidas
router.get("/auth/profile", verificarToken, getProfile);
router.get("/auth/me", verificarToken, getCurrentUser);

module.exports = router;
