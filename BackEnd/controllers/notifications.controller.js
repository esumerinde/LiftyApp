// controllers/notifications.controller.js
const { pool } = require("../config/database");

// Obtener notificaciones del usuario autenticado
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const [rows] = await pool
      .promise()
      .query(`
        SELECT * FROM notifications
        WHERE id_user = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);
    
    return res.json(rows);
  } catch (err) {
    console.error("Error en getMyNotifications:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Marcar notificación como leída
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const [result] = await pool
      .promise()
      .query(
        "UPDATE notifications SET is_read = TRUE WHERE id_notification = ? AND id_user = ?",
        [id, userId]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    return res.json({ message: "Notificación marcada como leída" });
  } catch (err) {
    console.error("Error en markAsRead:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Marcar todas como leídas
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id_user;

    await pool
      .promise()
      .query(
        "UPDATE notifications SET is_read = TRUE WHERE id_user = ? AND is_read = FALSE",
        [userId]
      );

    return res.json({ message: "Todas las notificaciones marcadas como leídas" });
  } catch (err) {
    console.error("Error en markAllAsRead:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Crear notificación
const createNotification = async (req, res) => {
  try {
    const { id_user, type, title, message, related_id } = req.body;

    if (!id_user || !type || !title || !message) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const [result] = await pool
      .promise()
      .query(
        `INSERT INTO notifications (id_user, type, title, message, related_id)
         VALUES (?, ?, ?, ?, ?)`,
        [id_user, type, title, message, related_id]
      );

    return res.status(201).json({
      message: "Notificación creada exitosamente",
      id_notification: result.insertId,
    });
  } catch (err) {
    console.error("Error en createNotification:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Eliminar notificación
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id_user;

    const [result] = await pool
      .promise()
      .query("DELETE FROM notifications WHERE id_notification = ? AND id_user = ?", [id, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Notificación no encontrada" });
    }

    return res.json({ message: "Notificación eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteNotification:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
};
