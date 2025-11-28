// controllers/dailyGoals.controller.js
const { pool } = require("../config/database");

// Helper para actualizar snapshot desde las metas actuales
const updateDailySnapshotFromGoals = async (userId, date) => {
  try {
    // Obtener metas actuales
    const [goals] = await pool.promise().query(
      `SELECT * FROM daily_goals WHERE id_user = ?`,
      [userId]
    );

    if (goals.length === 0) return;

    const goal = goals[0];

    // Obtener totales consumidos del día
    const [consumed] = await pool.promise().query(
      `SELECT 
        COALESCE(SUM(m.calories), 0) as calories_consumed,
        COALESCE(SUM(m.protein), 0) as protein_consumed,
        COALESCE(SUM(m.carbs), 0) as carbs_consumed,
        COALESCE(SUM(m.fats), 0) as fats_consumed
      FROM consumed_meals cm
      INNER JOIN meals m ON cm.id_meal = m.id_meal
      WHERE cm.id_user = ? AND cm.consumed_date = ?`,
      [userId, date]
    );

    const totals = consumed[0];

    // Insertar o actualizar snapshot
    await pool.promise().query(
      `INSERT INTO daily_goals_history 
        (id_user, snapshot_date, calories_goal, protein_goal, carbs_goal, fats_goal, water_goal,
         calories_consumed, protein_consumed, carbs_consumed, fats_consumed, water_consumed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        calories_consumed = VALUES(calories_consumed),
        protein_consumed = VALUES(protein_consumed),
        carbs_consumed = VALUES(carbs_consumed),
        fats_consumed = VALUES(fats_consumed),
        water_consumed = VALUES(water_consumed)`,
      [
        userId,
        date,
        goal.calories_goal,
        goal.protein_goal,
        goal.carbs_goal,
        goal.fats_goal,
        goal.water_goal,
        totals.calories_consumed,
        totals.protein_consumed,
        totals.carbs_consumed,
        totals.fats_consumed,
        goal.water_consumed,
      ]
    );
  } catch (error) {
    console.error("Error al actualizar snapshot diario:", error);
  }
};

// Obtener metas diarias del usuario
const getUserDailyGoals = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [rows] = await pool.promise().query(
      `SELECT 
        id_daily_goal,
        id_user,
        calories_goal,
        protein_goal,
        carbs_goal,
        fats_goal,
        water_goal,
        water_consumed,
        target_weight,
        created_at,
        updated_at
      FROM daily_goals
      WHERE id_user = ?`,
      [userId]
    );

    if (rows.length === 0) {
      // Si no tiene metas, crear unas por defecto
      const [result] = await pool.promise().query(
        `INSERT INTO daily_goals (id_user, calories_goal, protein_goal, carbs_goal, fats_goal, water_goal)
         VALUES (?, 2000, 150, 200, 60, 2.5)`,
        [userId]
      );

      return res.json({
        success: true,
        data: {
          id_daily_goal: result.insertId,
          id_user: userId,
          calories_goal: 2000,
          protein_goal: 150,
          carbs_goal: 200,
          fats_goal: 60,
          water_goal: 2.5,
          water_consumed: 0,
          target_weight: null,
        },
      });
    }

    return res.json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error("Error en getUserDailyGoals:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener metas diarias",
    });
  }
};

// Actualizar metas diarias del usuario
const updateUserDailyGoals = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { calories_goal, protein_goal, carbs_goal, fats_goal, water_goal } = req.body;

    await pool.promise().query(
      `UPDATE daily_goals 
       SET calories_goal = ?, 
           protein_goal = ?, 
           carbs_goal = ?, 
           fats_goal = ?, 
           water_goal = ?,
           updated_at = NOW()
       WHERE id_user = ?`,
      [calories_goal, protein_goal, carbs_goal, fats_goal, water_goal, userId]
    );

    return res.json({
      success: true,
      message: "Metas actualizadas correctamente",
    });
  } catch (error) {
    console.error("Error en updateUserDailyGoals:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar metas diarias",
    });
  }
};

// Agregar agua consumida
const addWater = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { liters } = req.body;

    if (!liters || liters <= 0) {
      return res.status(400).json({
        success: false,
        message: "Cantidad de agua inválida",
      });
    }

    // Obtener agua consumida actual y meta
    const [rows] = await pool.promise().query(
      `SELECT water_consumed, water_goal FROM daily_goals WHERE id_user = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron metas para este usuario",
      });
    }

    const currentWater = parseFloat(rows[0].water_consumed);
    const waterGoal = parseFloat(rows[0].water_goal);
    const newWater = Math.min(currentWater + parseFloat(liters), waterGoal);

    // Actualizar agua consumida
    await pool.promise().query(
      `UPDATE daily_goals SET water_consumed = ?, updated_at = NOW() WHERE id_user = ?`,
      [newWater, userId]
    );

    // Actualizar snapshot del día actual
    const today = new Date().toISOString().split("T")[0];
    await updateDailySnapshotFromGoals(userId, today);

    return res.json({
      success: true,
      data: {
        water_consumed: newWater,
        water_goal: waterGoal,
      },
    });
  } catch (error) {
    console.error("Error en addWater:", error);
    return res.status(500).json({
      success: false,
      message: "Error al agregar agua consumida",
    });
  }
};

// Resetear agua consumida
const resetWater = async (req, res) => {
  try {
    const userId = req.user.id_user;

    await pool.promise().query(
      `UPDATE daily_goals SET water_consumed = 0, updated_at = NOW() WHERE id_user = ?`,
      [userId]
    );

    // Actualizar snapshot del día actual
    const today = new Date().toISOString().split("T")[0];
    await updateDailySnapshotFromGoals(userId, today);

    return res.json({
      success: true,
      message: "Agua reseteada correctamente",
    });
  } catch (error) {
    console.error("Error en resetWater:", error);
    return res.status(500).json({
      success: false,
      message: "Error al resetear agua consumida",
    });
  }
};

// Guardar snapshot del día y obtener historial por fecha
const getDailyGoalsByDate = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "La fecha es requerida",
      });
    }

    // Buscar snapshot del día
    const [history] = await pool.promise().query(
      `SELECT * FROM daily_goals_history 
       WHERE id_user = ? AND snapshot_date = ?`,
      [userId, date]
    );

    if (history.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "No hay datos para esta fecha",
      });
    }

    return res.json({
      success: true,
      data: history[0],
    });
  } catch (error) {
    console.error("Error en getDailyGoalsByDate:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener historial",
    });
  }
};

// Guardar snapshot del día actual
const saveDailySnapshot = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const today = new Date().toISOString().split("T")[0];

    // Obtener metas actuales
    const [goals] = await pool.promise().query(
      `SELECT * FROM daily_goals WHERE id_user = ?`,
      [userId]
    );

    if (goals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No se encontraron metas para este usuario",
      });
    }

    const goal = goals[0];

    // Obtener totales consumidos del día
    const [consumed] = await pool.promise().query(
      `SELECT 
        COALESCE(SUM(m.calories), 0) as calories_consumed,
        COALESCE(SUM(m.protein), 0) as protein_consumed,
        COALESCE(SUM(m.carbs), 0) as carbs_consumed,
        COALESCE(SUM(m.fats), 0) as fats_consumed
      FROM consumed_meals cm
      INNER JOIN meals m ON cm.id_meal = m.id_meal
      WHERE cm.id_user = ? AND cm.consumed_date = ?`,
      [userId, today]
    );

    const totals = consumed[0];

    // Insertar o actualizar snapshot
    await pool.promise().query(
      `INSERT INTO daily_goals_history 
        (id_user, snapshot_date, calories_goal, protein_goal, carbs_goal, fats_goal, water_goal,
         calories_consumed, protein_consumed, carbs_consumed, fats_consumed, water_consumed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        calories_consumed = VALUES(calories_consumed),
        protein_consumed = VALUES(protein_consumed),
        carbs_consumed = VALUES(carbs_consumed),
        fats_consumed = VALUES(fats_consumed),
        water_consumed = VALUES(water_consumed)`,
      [
        userId,
        today,
        goal.calories_goal,
        goal.protein_goal,
        goal.carbs_goal,
        goal.fats_goal,
        goal.water_goal,
        totals.calories_consumed,
        totals.protein_consumed,
        totals.carbs_consumed,
        totals.fats_consumed,
        goal.water_consumed,
      ]
    );

    // Resetear agua para el nuevo día
    await pool.promise().query(
      `UPDATE daily_goals SET water_consumed = 0, updated_at = NOW() WHERE id_user = ?`,
      [userId]
    );

    return res.json({
      success: true,
      message: "Snapshot guardado correctamente",
    });
  } catch (error) {
    console.error("Error en saveDailySnapshot:", error);
    return res.status(500).json({
      success: false,
      message: "Error al guardar snapshot diario",
    });
  }
};

module.exports = {
  getUserDailyGoals,
  updateUserDailyGoals,
  addWater,
  resetWater,
  getDailyGoalsByDate,
  saveDailySnapshot,
};
