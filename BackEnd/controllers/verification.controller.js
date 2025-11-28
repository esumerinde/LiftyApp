// controllers/verification.controller.js
const { pool } = require("../config/database");
const { sendVerificationCodeEmail } = require("../utils/mailer");

// Tiempo de expiración del código (15 minutos)
const CODE_EXPIRATION_MINUTES = 15;

// Generar código de verificación de 6 dígitos
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ========== SEND VERIFICATION CODE ==========
const requestVerificationCode = async (req, res) => {
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
    // Verificar si el email ya está registrado
    const [existingUsers] = await pool
      .promise()
      .query("SELECT id_user FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este email ya está registrado. Intenta iniciar sesión.",
      });
    }

    // Generar código de verificación
    const code = generateVerificationCode();
    const expiresAt = new Date(
      Date.now() + CODE_EXPIRATION_MINUTES * 60 * 1000
    );

    // Eliminar códigos anteriores del mismo email
    await pool
      .promise()
      .query("DELETE FROM email_verifications WHERE email = ?", [email]);

    // Guardar código en la base de datos (sin hash, para simplificar)
    await pool
      .promise()
      .query(
        "INSERT INTO email_verifications (email, code, expires_at, verified) VALUES (?, ?, ?, FALSE)",
        [email, code, expiresAt]
      );

    // Enviar email con nodemailer
    await sendVerificationCodeEmail({ to: email, code });

    console.log("✅ Código de verificación enviado a:", email);

    return res.status(200).json({
      success: true,
      message: "Código de verificación enviado al email",
      expiresIn: CODE_EXPIRATION_MINUTES * 60, // en segundos
    });
  } catch (error) {
    console.error("❌ Error enviando código:", error);
    return res.status(500).json({
      success: false,
      message: "Error al enviar el código de verificación",
      error: error.message,
    });
  }
};

// Verificar código
const verifyCode = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({
      success: false,
      message: "Email y código son requeridos",
    });
  }

  try {
    // Buscar el código en la base de datos
    const [verifications] = await pool
      .promise()
      .query(
        "SELECT * FROM email_verifications WHERE email = ? AND code = ? AND verified = FALSE",
        [email, code]
      );

    if (verifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Código inválido o ya utilizado",
      });
    }

    const verification = verifications[0];

    // Verificar si el código expiró
    if (new Date() > new Date(verification.expires_at)) {
      return res.status(400).json({
        success: false,
        message: "El código ha expirado. Solicita uno nuevo.",
      });
    }

    // Marcar código como verificado
    await pool
      .promise()
      .query("UPDATE email_verifications SET verified = TRUE WHERE id = ?", [
        verification.id,
      ]);

    console.log("✅ Email verificado exitosamente:", email);

    return res.status(200).json({
      success: true,
      message: "Email verificado correctamente",
    });
  } catch (error) {
    console.error("❌ Error verificando código:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar el código",
      error: error.message,
    });
  }
};

// Verificar si un email ya fue verificado (helper)
const isEmailVerified = async (email) => {
  try {
    const [rows] = await pool
      .promise()
      .query(
        "SELECT 1 FROM email_verifications WHERE email = ? AND verified = TRUE LIMIT 1",
        [email]
      );
    return rows.length > 0;
  } catch (err) {
    console.error("Error en isEmailVerified:", err);
    return false;
  }
};

module.exports = {
  requestVerificationCode,
  verifyCode,
  isEmailVerified,
};
