// controllers/subscriptions.controller.js
const { pool } = require("../config/database");

// Obtener todas las suscripciones
const getAllSubscriptions = async (req, res) => {
  try {
    const [rows] = await pool
      .promise()
      .query(`
        SELECT s.*, u.full_name, u.email
        FROM subscriptions s
        JOIN users u ON s.id_user = u.id_user
        ORDER BY s.created_at DESC
      `);
    
    return res.json(rows);
  } catch (err) {
    console.error("Error en getAllSubscriptions:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener suscripción del usuario autenticado
const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const [rows] = await pool
      .promise()
      .query(`
        SELECT s.*, 
               t.full_name as trainer_name,
               n.full_name as nutritionist_name
        FROM subscriptions s
        LEFT JOIN users t ON s.id_trainer = t.id_user
        LEFT JOIN users n ON s.id_nutritionist = n.id_user
        WHERE s.id_user = ? AND s.status = 'active'
        LIMIT 1
      `, [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "No tienes suscripción activa" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error en getMySubscription:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Crear suscripción
const createSubscription = async (req, res) => {
  try {
    const { id_user, plan_type, id_trainer, id_nutritionist, next_payment_date } = req.body;

    if (!id_user || !plan_type || !next_payment_date) {
      return res.status(400).json({ message: "Faltan datos requeridos" });
    }

    const [result] = await pool
      .promise()
      .query(
        `INSERT INTO subscriptions (id_user, plan_type, id_trainer, id_nutritionist, next_payment_date, status, auto_renew)
         VALUES (?, ?, ?, ?, ?, 'active', TRUE)`,
        [id_user, plan_type, id_trainer, id_nutritionist, next_payment_date]
      );

    return res.status(201).json({
      message: "Suscripción creada exitosamente",
      id_subscription: result.insertId,
    });
  } catch (err) {
    console.error("Error en createSubscription:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Actualizar suscripción
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_type, id_trainer, id_nutritionist, status, next_payment_date, auto_renew } = req.body;

    const [result] = await pool
      .promise()
      .query(
        `UPDATE subscriptions 
         SET plan_type = ?, id_trainer = ?, id_nutritionist = ?, status = ?, next_payment_date = ?, auto_renew = ?
         WHERE id_subscription = ?`,
        [plan_type, id_trainer, id_nutritionist, status, next_payment_date, auto_renew, id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Suscripción no encontrada" });
    }

    return res.json({ message: "Suscripción actualizada exitosamente" });
  } catch (err) {
    console.error("Error en updateSubscription:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Cancelar suscripción
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool
      .promise()
      .query(
        `UPDATE subscriptions 
         SET status = 'cancelled', cancelled_at = NOW(), auto_renew = FALSE
         WHERE id_subscription = ?`,
        [id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Suscripción no encontrada" });
    }

    return res.json({ message: "Suscripción cancelada exitosamente" });
  } catch (err) {
    console.error("Error en cancelSubscription:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getAllSubscriptions,
  getMySubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
};
