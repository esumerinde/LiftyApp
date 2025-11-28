// routes/verification.route.js
const express = require("express");
const { 
  requestVerificationCode, 
  verifyCode 
} = require("../controllers/verification.controller");

const router = express.Router();

// Solicitar código de verificación
router.post("/verification/request", requestVerificationCode);

// Verificar código
router.post("/verification/verify", verifyCode);

module.exports = router;
