// routes/notifications.route.js
const express = require("express");
const { 
  getMyNotifications, 
  markAsRead, 
  markAllAsRead, 
  createNotification,
  deleteNotification 
} = require("../controllers/notifications.controller");
const { verificarToken, verificarRol } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas protegidas
router.get("/notifications", verificarToken, getMyNotifications);
router.put("/notifications/:id/read", verificarToken, markAsRead);
router.put("/notifications/read-all", verificarToken, markAllAsRead);
router.post("/notifications", verificarToken, verificarRol("admin"), createNotification);
router.delete("/notifications/:id", verificarToken, deleteNotification);

module.exports = router;
