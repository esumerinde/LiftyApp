// controllers/diets.controller.js
const { pool } = require("../config/database");

// Obtener todas las dietas del usuario
const getUserDiets = async (req, res) => {
  const userId = req.user.id_user;

  try {
    const [diets] = await pool.promise().query(
      `SELECT 
        d.*,
        COUNT(dm.id_diet_meal) as meals_count
      FROM diets d
      LEFT JOIN diet_meals dm ON d.id_diet = dm.id_diet
      WHERE d.id_user = ? AND d.is_active = 1
      GROUP BY d.id_diet
      ORDER BY d.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: diets,
    });
  } catch (error) {
    console.error("Error al obtener dietas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las dietas",
    });
  }
};

// Obtener una dieta por ID con sus comidas
const getDietById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;

  try {
    // Obtener la dieta
    const [diets] = await pool.promise().query(
      `SELECT * FROM diets WHERE id_diet = ? AND id_user = ? AND is_active = 1`,
      [id, userId]
    );

    if (diets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    // Obtener las comidas de la dieta
    const [meals] = await pool.promise().query(
      `SELECT 
        dm.id_diet_meal,
        dm.meal_order,
        m.*
      FROM diet_meals dm
      INNER JOIN meals m ON dm.id_meal = m.id_meal
      WHERE dm.id_diet = ?
      ORDER BY dm.meal_order ASC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...diets[0],
        meals: meals,
      },
    });
  } catch (error) {
    console.error("Error al obtener dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la dieta",
    });
  }
};

// Crear una nueva dieta
const createDiet = async (req, res) => {
  const userId = req.user.id_user;
  const {
    name,
    description,
    goal,
    calories_per_day,
    protein_goal,
    carbs_goal,
    fats_goal,
    water_goal,
  } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "El nombre de la dieta es requerido",
    });
  }

  try {
    const [result] = await pool.promise().query(
      `INSERT INTO diets (
        id_user, 
        name, 
        description, 
        goal, 
        calories_per_day,
        protein_goal,
        carbs_goal,
        fats_goal,
        water_goal,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        userId,
        name,
        description || null,
        goal || null,
        calories_per_day || 2000,
        protein_goal || 150,
        carbs_goal || 200,
        fats_goal || 60,
        water_goal || 2.5,
      ]
    );

    res.json({
      success: true,
      data: {
        id_diet: result.insertId,
        name,
        description,
        goal,
        calories_per_day,
        protein_goal,
        carbs_goal,
        fats_goal,
        water_goal,
      },
      message: "Dieta creada exitosamente",
    });
  } catch (error) {
    console.error("Error al crear dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear la dieta",
    });
  }
};

// Actualizar una dieta
const updateDiet = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;
  const {
    name,
    description,
    goal,
    calories_per_day,
    protein_goal,
    carbs_goal,
    fats_goal,
    water_goal,
  } = req.body;

  try {
    // Verificar que la dieta pertenece al usuario y si está actualmente activada
    const [diets] = await pool.promise().query(
      `SELECT id_diet, is_currently_active FROM diets WHERE id_diet = ? AND id_user = ?`,
      [id, userId]
    );

    if (diets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    const isCurrentlyActive = diets[0].is_currently_active;

    // Actualizar la dieta
    await pool.promise().query(
      `UPDATE diets SET 
        name = ?,
        description = ?,
        goal = ?,
        calories_per_day = ?,
        protein_goal = ?,
        carbs_goal = ?,
        fats_goal = ?,
        water_goal = ?,
        updated_at = NOW()
      WHERE id_diet = ?`,
      [
        name,
        description,
        goal,
        calories_per_day,
        protein_goal,
        carbs_goal,
        fats_goal,
        water_goal,
        id,
      ]
    );

    // Si la dieta está actualmente activada, actualizar también las metas diarias
    if (isCurrentlyActive === 1) {
      await pool.promise().query(
        `INSERT INTO daily_goals (id_user, calories_goal, protein_goal, carbs_goal, fats_goal, water_goal, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
          calories_goal = VALUES(calories_goal),
          protein_goal = VALUES(protein_goal),
          carbs_goal = VALUES(carbs_goal),
          fats_goal = VALUES(fats_goal),
          water_goal = VALUES(water_goal),
          updated_at = NOW()`,
        [
          userId,
          calories_per_day,
          protein_goal,
          carbs_goal,
          fats_goal,
          water_goal,
        ]
      );
    }

    res.json({
      success: true,
      message: isCurrentlyActive === 1 
        ? "Dieta y metas diarias actualizadas exitosamente" 
        : "Dieta actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error al actualizar dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la dieta",
    });
  }
};

// Eliminar una dieta (soft delete)
const deleteDiet = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;

  try {
    const [result] = await pool.promise().query(
      `UPDATE diets SET is_active = 0, updated_at = NOW() 
       WHERE id_diet = ? AND id_user = ?`,
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    res.json({
      success: true,
      message: "Dieta eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar la dieta",
    });
  }
};

// Agregar comida a una dieta
const addMealToDiet = async (req, res) => {
  const { id } = req.params; // id_diet
  const userId = req.user.id_user;
  const { id_meal, meal_order } = req.body;

  try {
    // Verificar que la dieta pertenece al usuario
    const [diets] = await pool.promise().query(
      `SELECT id_diet FROM diets WHERE id_diet = ? AND id_user = ?`,
      [id, userId]
    );

    if (diets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    // Verificar que la comida pertenece al usuario
    const [meals] = await pool.promise().query(
      `SELECT id_meal FROM meals WHERE id_meal = ? AND id_user = ?`,
      [id_meal, userId]
    );

    if (meals.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comida no encontrada",
      });
    }

    // Agregar la comida a la dieta
    await pool.promise().query(
      `INSERT INTO diet_meals (id_diet, id_meal, meal_order) VALUES (?, ?, ?)`,
      [id, id_meal, meal_order || 0]
    );

    res.json({
      success: true,
      message: "Comida agregada a la dieta exitosamente",
    });
  } catch (error) {
    console.error("Error al agregar comida a dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar comida a la dieta",
    });
  }
};

// Eliminar comida de una dieta
const removeMealFromDiet = async (req, res) => {
  const { id, mealId } = req.params;
  const userId = req.user.id_user;

  try {
    // Verificar que la dieta pertenece al usuario
    const [diets] = await pool.promise().query(
      `SELECT id_diet FROM diets WHERE id_diet = ? AND id_user = ?`,
      [id, userId]
    );

    if (diets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    // Eliminar solo la primera instancia de la comida (por id_diet_meal)
    await pool.promise().query(
      `DELETE FROM diet_meals WHERE id_diet = ? AND id_meal = ? LIMIT 1`,
      [id, mealId]
    );

    res.json({
      success: true,
      message: "Comida eliminada de la dieta exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar comida de dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar comida de la dieta",
    });
  }
};

// Activar una dieta (aplicar sus metas a daily_goals)
const activateDiet = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id_user;

  try {
    // Obtener la dieta
    const [diets] = await pool.promise().query(
      `SELECT * FROM diets WHERE id_diet = ? AND id_user = ? AND is_active = 1`,
      [id, userId]
    );

    if (diets.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Dieta no encontrada",
      });
    }

    const diet = diets[0];

    // Desactivar todas las dietas del usuario
    await pool.promise().query(
      `UPDATE diets SET is_currently_active = 0 WHERE id_user = ?`,
      [userId]
    );

    // Marcar esta dieta como actualmente activa
    await pool.promise().query(
      `UPDATE diets SET is_currently_active = 1 WHERE id_diet = ?`,
      [id]
    );

    // Actualizar o crear las metas diarias del usuario
    await pool.promise().query(
      `INSERT INTO daily_goals (id_user, calories_goal, protein_goal, carbs_goal, fats_goal, water_goal, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE
        calories_goal = VALUES(calories_goal),
        protein_goal = VALUES(protein_goal),
        carbs_goal = VALUES(carbs_goal),
        fats_goal = VALUES(fats_goal),
        water_goal = VALUES(water_goal),
        updated_at = NOW()`,
      [
        userId,
        diet.calories_per_day,
        diet.protein_goal,
        diet.carbs_goal,
        diet.fats_goal,
        diet.water_goal,
      ]
    );

    res.json({
      success: true,
      message: "Dieta activada exitosamente. Metas diarias actualizadas.",
      data: {
        calories_goal: diet.calories_per_day,
        protein_goal: diet.protein_goal,
        carbs_goal: diet.carbs_goal,
        fats_goal: diet.fats_goal,
        water_goal: diet.water_goal,
      },
    });
  } catch (error) {
    console.error("Error al activar dieta:", error);
    res.status(500).json({
      success: false,
      message: "Error al activar la dieta",
    });
  }
};

module.exports = {
  getUserDiets,
  getDietById,
  createDiet,
  updateDiet,
  deleteDiet,
  addMealToDiet,
  removeMealFromDiet,
  activateDiet,
};
