// controllers/messages.controller.js
const { pool } = require("../config/database");

// Obtener todas las conversaciones del usuario autenticado
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [conversations] = await pool.promise().query(`
      WITH last_messages AS (
        SELECT 
          CASE 
            WHEN dm.sender_id = ? THEN dm.receiver_id 
            ELSE dm.sender_id 
          END as other_user_id,
          dm.content,
          dm.created_at,
          ROW_NUMBER() OVER (
            PARTITION BY CASE 
              WHEN dm.sender_id = ? THEN dm.receiver_id 
              ELSE dm.sender_id 
            END 
            ORDER BY dm.created_at DESC
          ) as rn
        FROM direct_messages dm
        WHERE dm.sender_id = ? OR dm.receiver_id = ?
      ),
      unread_counts AS (
        SELECT 
          sender_id as other_user_id,
          COUNT(*) as unread_count
        FROM direct_messages
        WHERE receiver_id = ? AND read_at IS NULL
        GROUP BY sender_id
      )
      SELECT 
        lm.other_user_id,
        u.username,
        u.full_name,
        u.avatar_url,
        lm.content as last_message,
        lm.created_at as last_message_time,
        COALESCE(uc.unread_count, 0) as unread_count
      FROM last_messages lm
      JOIN users u ON u.id_user = lm.other_user_id
      LEFT JOIN unread_counts uc ON uc.other_user_id = lm.other_user_id
      WHERE lm.rn = 1
      ORDER BY lm.created_at DESC
    `, [userId, userId, userId, userId, userId]);

    return res.json(conversations);
  } catch (err) {
    console.error("Error en getConversations:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener mensajes de una conversación específica
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { otherUserId } = req.params;

    // Marcar mensajes como leídos
    await pool.promise().query(
      `UPDATE direct_messages 
       SET read_at = NOW() 
       WHERE receiver_id = ? AND sender_id = ? AND read_at IS NULL`,
      [userId, otherUserId]
    );

    // Obtener mensajes
    const [messages] = await pool.promise().query(`
      SELECT 
        dm.id_message,
        dm.sender_id,
        dm.receiver_id,
        dm.content,
        dm.read_at,
        dm.created_at,
        u.username as sender_username,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM direct_messages dm
      JOIN users u ON u.id_user = dm.sender_id
      WHERE (dm.sender_id = ? AND dm.receiver_id = ?)
         OR (dm.sender_id = ? AND dm.receiver_id = ?)
      ORDER BY dm.created_at ASC
    `, [userId, otherUserId, otherUserId, userId]);

    return res.json(messages);
  } catch (err) {
    console.error("Error en getMessages:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Enviar un mensaje
const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { receiverId, content } = req.body;

    if (!receiverId || !content || content.trim() === "") {
      return res.status(400).json({ message: "Datos incompletos" });
    }

    // Verificar que el receptor existe
    const [receiver] = await pool.promise().query(
      "SELECT id_user FROM users WHERE id_user = ? AND status = 'active'",
      [receiverId]
    );

    if (receiver.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // No puede enviarse mensaje a sí mismo
    if (parseInt(receiverId) === userId) {
      return res.status(400).json({ message: "No puedes enviarte mensajes a ti mismo" });
    }

    // Insertar mensaje
    const [result] = await pool.promise().query(
      `INSERT INTO direct_messages (sender_id, receiver_id, content, created_at) 
       VALUES (?, ?, ?, NOW())`,
      [userId, receiverId, content.trim()]
    );

    // Obtener el mensaje recién creado
    const [newMessage] = await pool.promise().query(`
      SELECT 
        dm.id_message,
        dm.sender_id,
        dm.receiver_id,
        dm.content,
        dm.read_at,
        dm.created_at,
        u.username as sender_username,
        u.full_name as sender_name,
        u.avatar_url as sender_avatar
      FROM direct_messages dm
      JOIN users u ON u.id_user = dm.sender_id
      WHERE dm.id_message = ?
    `, [result.insertId]);

    return res.status(201).json({
      message: "Mensaje enviado",
      data: newMessage[0]
    });
  } catch (err) {
    console.error("Error en sendMessage:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Marcar mensaje como leído
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { messageId } = req.params;

    await pool.promise().query(
      `UPDATE direct_messages 
       SET read_at = NOW() 
       WHERE id_message = ? AND receiver_id = ? AND read_at IS NULL`,
      [messageId, userId]
    );

    return res.json({ message: "Mensaje marcado como leído" });
  } catch (err) {
    console.error("Error en markAsRead:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener información de un chat (verificar si existe conversación)
const getChatInfo = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { otherUserId } = req.params;

    // Verificar que el otro usuario existe
    const [otherUser] = await pool.promise().query(
      "SELECT id_user, username, full_name, avatar_url FROM users WHERE id_user = ? AND status = 'active'",
      [otherUserId]
    );

    if (otherUser.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si existe al menos un mensaje
    const [messages] = await pool.promise().query(
      `SELECT COUNT(*) as message_count 
       FROM direct_messages 
       WHERE (sender_id = ? AND receiver_id = ?) 
          OR (sender_id = ? AND receiver_id = ?)`,
      [userId, otherUserId, otherUserId, userId]
    );

    return res.json({
      user: otherUser[0],
      hasMessages: messages[0].message_count > 0
    });
  } catch (err) {
    console.error("Error en getChatInfo:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getChatInfo
};
