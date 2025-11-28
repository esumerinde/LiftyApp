// controllers/passwordReset.controller.js
const { pool } = require("../config/database");
const bcrypt = require("bcrypt");
const { sendPasswordResetCodeEmail } = require("../utils/mailer");

// Constantes
const CODE_EXPIRATION_MINUTES = 15;
const MAX_ATTEMPTS = 3;
const SALT_ROUNDS = 10;

// Generar código de 6 dígitos
function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========== SOLICITAR CÓDIGO DE RECUPERACIÓN ==========
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  // Validación de email
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "El email es requerido",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email inválido",
    });
  }

  try {
    // Verificar si el usuario existe
    const [users] = await pool
      .promise()
      .query("SELECT id_user, email FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No existe una cuenta con este email",
      });
    }

    // Generar código y fecha de expiración
    const code = generateResetCode();
    const codeHash = await bcrypt.hash(code, SALT_ROUNDS);
    const expiresAt = new Date(Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000);

    // Eliminar códigos antiguos del mismo email
    await pool
      .promise()
      .query("DELETE FROM password_resets WHERE email = ?", [email]);

    // Insertar nuevo código
    await pool.promise().query(
      "INSERT INTO password_resets (email, code_hash, expires_at) VALUES (?, ?, ?)",
      [email, codeHash, expiresAt]
    );

    // Enviar email con el código
    await sendPasswordResetCodeEmail({
      to: email,
      code: code,
    });

    console.log(`✅ Código de recuperación generado para ${email}: ${code}`);

    res.json({
      success: true,
      message: "Código de verificación enviado a tu email",
    });
  } catch (error) {
    console.error("❌ Error en requestPasswordReset:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud",
    });
  }
};

// ========== VERIFICAR CÓDIGO Y RESETEAR CONTRASEÑA ==========
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  // Validaciones
  if (!email || !code || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, código y nueva contraseña son requeridos",
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 6 caracteres",
    });
  }

  try {
    // Buscar código de reset no usado y no expirado
    const [resets] = await pool.promise().query(
      `SELECT * FROM password_resets 
       WHERE email = ? AND used = 0 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (resets.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Código inválido o expirado. Solicita uno nuevo.",
      });
    }

    const resetRecord = resets[0];

    // Verificar intentos
    if (resetRecord.attempts >= MAX_ATTEMPTS) {
      return res.status(400).json({
        success: false,
        message: "Demasiados intentos. Solicita un nuevo código.",
      });
    }

    // Verificar código
    const isCodeValid = await bcrypt.compare(code, resetRecord.code_hash);

    if (!isCodeValid) {
      // Incrementar intentos
      await pool.promise().query(
        "UPDATE password_resets SET attempts = attempts + 1 WHERE id_reset = ?",
        [resetRecord.id_reset]
      );

      return res.status(400).json({
        success: false,
        message: `Código incorrecto. Intentos restantes: ${MAX_ATTEMPTS - resetRecord.attempts - 1}`,
      });
    }

    // Código válido - actualizar contraseña del usuario
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    await pool.promise().query(
      "UPDATE users SET password = ? WHERE email = ?",
      [passwordHash, email]
    );

    // Marcar código como usado
    await pool.promise().query(
      "UPDATE password_resets SET used = 1 WHERE id_reset = ?",
      [resetRecord.id_reset]
    );

    console.log(`✅ Contraseña actualizada para ${email}`);

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al resetear la contraseña",
    });
  }
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
