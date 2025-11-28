// routes/passwordReset.route.js
const express = require("express");
const router = express.Router();
const {
  requestPasswordReset,
  resetPassword,
} = require("../controllers/passwordReset.controller");

// Solicitar código de recuperación
router.post("/request", requestPasswordReset);

// Verificar código y resetear contraseña
router.post("/reset", resetPassword);

module.exports = router;
