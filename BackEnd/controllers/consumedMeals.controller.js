const { pool } = require("../config/database");

// Helper para actualizar el snapshot del día actual
const updateDailySnapshot = async (userId, date) => {
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

    // Insertar o actualizar snapshot (guardando los objetivos actuales del día)
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

// Agregar comida consumida
const addConsumedMeal = async (req, res) => {
  try {
    const { id_meal } = req.body;
    const id_user = req.user.id_user;

    if (!id_meal) {
      return res.status(400).json({
        success: false,
        error: "El ID de la comida es requerido",
      });
    }

    // Verificar que la comida pertenece al usuario
    const [mealCheck] = await pool.promise().query(
      "SELECT id_meal FROM meals WHERE id_meal = ? AND id_user = ?",
      [id_meal, id_user]
    );

    if (mealCheck.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Comida no encontrada",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    const [result] = await pool.promise().query(
      "INSERT INTO consumed_meals (id_user, id_meal, consumed_date) VALUES (?, ?, ?)",
      [id_user, id_meal, today]
    );

    // Actualizar snapshot del día actual con los objetivos actuales
    await updateDailySnapshot(id_user, today);

    res.json({
      success: true,
      data: {
        id_consumed: result.insertId,
        id_meal,
        consumed_date: today,
      },
      message: "Comida agregada exitosamente",
    });
  } catch (error) {
    console.error("Error al agregar comida consumida:", error);
    res.status(500).json({
      success: false,
      error: "Error al agregar comida consumida",
    });
  }
};

// Obtener comidas consumidas del día de hoy
const getTodayConsumedMeals = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const today = new Date().toISOString().split("T")[0];

    const [consumed] = await pool.promise().query(
      `SELECT 
        cm.id_consumed,
        cm.consumed_at,
        m.id_meal,
        m.name,
        m.calories,
        m.protein,
        m.carbs,
        m.fats,
        m.image_url,
        m.icon
      FROM consumed_meals cm
      INNER JOIN meals m ON cm.id_meal = m.id_meal
      WHERE cm.id_user = ? AND cm.consumed_date = ?
      ORDER BY cm.consumed_at DESC`,
      [id_user, today]
    );

    // Calcular totales
    const totals = consumed.reduce(
      (acc, meal) => ({
        calories: acc.calories + parseFloat(meal.calories || 0),
        protein: acc.protein + parseFloat(meal.protein || 0),
        carbs: acc.carbs + parseFloat(meal.carbs || 0),
        fats: acc.fats + parseFloat(meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    res.json({
      success: true,
      data: {
        consumed,
        totals,
      },
    });
  } catch (error) {
    console.error("Error al obtener comidas consumidas:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener comidas consumidas",
    });
  }
};

// Eliminar comida consumida
const deleteConsumedMeal = async (req, res) => {
  try {
    const { id } = req.params;
    const id_user = req.user.id_user;

    // Verificar que la comida consumida pertenece al usuario
    const [check] = await pool.promise().query(
      "SELECT id_consumed FROM consumed_meals WHERE id_consumed = ? AND id_user = ?",
      [id, id_user]
    );

    if (check.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Comida consumida no encontrada",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    await pool.promise().query(
      "DELETE FROM consumed_meals WHERE id_consumed = ?",
      [id]
    );

    // Actualizar snapshot del día actual
    await updateDailySnapshot(id_user, today);

    res.json({
      success: true,
      message: "Comida consumida eliminada",
    });
  } catch (error) {
    console.error("Error al eliminar comida consumida:", error);
    res.status(500).json({
      success: false,
      error: "Error al eliminar comida consumida",
    });
  }
};

// Obtener comidas consumidas por fecha
const getConsumedMealsByDate = async (req, res) => {
  try {
    const id_user = req.user.id_user;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: "La fecha es requerida",
      });
    }

    const [consumed] = await pool.promise().query(
      `SELECT 
        cm.id_consumed,
        cm.consumed_at,
        m.id_meal,
        m.name,
        m.calories,
        m.protein,
        m.carbs,
        m.fats,
        m.image_url,
        m.icon
      FROM consumed_meals cm
      INNER JOIN meals m ON cm.id_meal = m.id_meal
      WHERE cm.id_user = ? AND cm.consumed_date = ?
      ORDER BY cm.consumed_at DESC`,
      [id_user, date]
    );

    // Calcular totales
    const totals = consumed.reduce(
      (acc, meal) => ({
        calories: acc.calories + parseFloat(meal.calories || 0),
        protein: acc.protein + parseFloat(meal.protein || 0),
        carbs: acc.carbs + parseFloat(meal.carbs || 0),
        fats: acc.fats + parseFloat(meal.fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    res.json({
      success: true,
      data: {
        consumed,
        totals,
        date,
      },
    });
  } catch (error) {
    console.error("Error al obtener comidas consumidas por fecha:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener comidas consumidas",
    });
  }
};

module.exports = {
  addConsumedMeal,
  getTodayConsumedMeals,
  deleteConsumedMeal,
  getConsumedMealsByDate,
};
