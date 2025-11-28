// routes/messages.route.js
const express = require("express");
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getChatInfo
} = require("../controllers/messages.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Obtener todas las conversaciones
router.get("/conversations", getConversations);

// Obtener info de un chat específico
router.get("/chat/:otherUserId/info", getChatInfo);

// Obtener mensajes de una conversación
router.get("/chat/:otherUserId", getMessages);

// Enviar mensaje
router.post("/send", sendMessage);

// Marcar mensaje como leído
router.put("/:messageId/read", markAsRead);

module.exports = router;
