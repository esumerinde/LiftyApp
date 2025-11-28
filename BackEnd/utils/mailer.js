// utils/mailer.js
const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("📧 Configurando nodemailer con:");
console.log("  SMTP_HOST:", process.env.SMTP_HOST);
console.log("  SMTP_PORT:", process.env.SMTP_PORT);
console.log("  SMTP_SECURE:", process.env.SMTP_SECURE);
console.log("  SMTP_USER:", process.env.SMTP_USER);
console.log("  SMTP_PASS:", process.env.SMTP_PASS ? "***configurado***" : "❌ NO CONFIGURADO");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true", // true para puerto 465, false para otros
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Permitir certificados autofirmados en desarrollo
  }
});

// Verificar la conexión al iniciar
transporter.verify(function(error, success) {
  if (error) {
    console.error("❌ Error de conexión con el servidor SMTP:", error.message);
  } else {
    console.log("✅ Servidor SMTP listo para enviar emails");
  }
});

// Enviar email de verificación con código
async function sendVerificationCodeEmail({ to, code }) {
  try {
    console.log(`📧 Intentando enviar código ${code} a ${to}...`);
    
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5">
        <h2>Verificá tu correo - LiftyApp</h2>
        <p>Tu código de verificación es:</p>
        <p style="font-size:22px;letter-spacing:6px;font-weight:bold">${code}</p>
        <p>Este código vence en 15 minutos.</p>
      </div>
    `;
    
    const info = await transporter.sendMail({
      from: `"LiftyApp" <${process.env.SMTP_USER}>`,
      to,
      subject: "Código de verificación - LiftyApp",
      html,
    });
    
    console.log("✅ Email enviado exitosamente:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando email:", error.message);
    throw error;
  }
}

// Enviar email de bienvenida
async function sendWelcomeEmail({ to, name }) {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>¡Bienvenido a LiftyApp!</h2>
      <p>Hola ${name},</p>
      <p>Tu cuenta ha sido creada exitosamente. ¡Estamos felices de tenerte con nosotros!</p>
      <p>Comienza a disfrutar de todas las funcionalidades de nuestra plataforma.</p>
    </div>
  `;
  return transporter.sendMail({
    from: `"LiftyApp" <${process.env.SMTP_USER}>`,
    to,
    subject: "¡Bienvenido a LiftyApp!",
    html,
  });
}

// Enviar notificación de pago
async function sendPaymentNotification({ to, amount, paymentDate }) {
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5">
      <h2>Confirmación de Pago - LiftyApp</h2>
      <p>Tu pago de $${amount} ha sido procesado exitosamente.</p>
      <p>Fecha: ${paymentDate}</p>
      <p>Gracias por tu preferencia.</p>
    </div>
  `;
  return transporter.sendMail({
    from: `"LiftyApp" <${process.env.SMTP_USER}>`,
    to,
    subject: "Confirmación de Pago - LiftyApp",
    html,
  });
}

// Enviar email de recuperación de contraseña
async function sendPasswordResetCodeEmail({ to, code }) {
  try {
    console.log(`📧 Intentando enviar código de recuperación ${code} a ${to}...`);
    
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:600px;margin:0 auto;padding:20px;">
        <div style="background:linear-gradient(135deg,#FFD700,#FFA500);padding:30px;border-radius:10px;text-align:center;">
          <h1 style="color:#000;margin:0;">🔒 Recuperación de Contraseña</h1>
        </div>
        <div style="background:#1a1a1a;padding:30px;border-radius:10px;margin-top:20px;">
          <h2 style="color:#FFD700;">Código de Verificación</h2>
          <p style="color:#fff;font-size:16px;">Hemos recibido una solicitud para restablecer tu contraseña.</p>
          <p style="color:#fff;font-size:16px;">Tu código de verificación es:</p>
          <div style="background:#2a2a2a;padding:20px;border-radius:8px;text-align:center;margin:20px 0;">
            <p style="font-size:32px;letter-spacing:8px;font-weight:bold;color:#FFD700;margin:0;">${code}</p>
          </div>
          <p style="color:#aaa;font-size:14px;">⏰ Este código expira en 15 minutos.</p>
          <p style="color:#aaa;font-size:14px;">Si no solicitaste este cambio, ignora este mensaje.</p>
        </div>
        <div style="text-align:center;margin-top:20px;color:#666;font-size:12px;">
          <p>© 2025 LiftyApp - Tu compañero de fitness</p>
        </div>
      </div>
    `;
    
    const info = await transporter.sendMail({
      from: `"LiftyApp - Soporte" <${process.env.SMTP_USER}>`,
      to,
      subject: "🔐 Recuperación de Contraseña - LiftyApp",
      html,
    });
    
    console.log("✅ Email de recuperación enviado exitosamente:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error enviando email de recuperación:", error.message);
    throw error;
  }
}

module.exports = { 
  transporter, 
  sendVerificationCodeEmail, 
  sendWelcomeEmail,
  sendPaymentNotification,
  sendPasswordResetCodeEmail 
};
