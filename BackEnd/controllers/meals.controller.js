// controllers/meals.controller.js
const { pool } = require("../config/database");

// Obtener todas las comidas del usuario
const getUserMeals = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [rows] = await pool.promise().query(
      `SELECT 
        id_meal,
        name,
        calories,
        protein,
        carbs,
        fats,
        image_url,
        icon,
        created_at
      FROM meals
      WHERE id_user = ?
      ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error en getUserMeals:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener comidas",
    });
  }
};

// Crear nueva comida
const createMeal = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { name, calories, protein, carbs, fats, icon } = req.body;

    // Validar datos requeridos
    if (!name || !calories || !protein || !carbs || !fats) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos (nombre, calorías, proteínas, carbohidratos, grasas)",
      });
    }

    const [result] = await pool.promise().query(
      `INSERT INTO meals (id_user, name, calories, protein, carbs, fats, image_url, icon)
       VALUES (?, ?, ?, ?, ?, ?, NULL, ?)`,
      [userId, name, calories, protein, carbs, fats, icon || 'UtensilsCrossed']
    );

    return res.status(201).json({
      success: true,
      message: "Comida creada exitosamente",
      data: {
        id_meal: result.insertId,
        name,
        calories,
        protein,
        carbs,
        fats,
        image_url: null,
        icon,
      },
    });
  } catch (error) {
    console.error("Error en createMeal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al crear comida",
    });
  }
};

// Actualizar comida
const updateMeal = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { id } = req.params;
    const { name, calories, protein, carbs, fats, icon } = req.body;

    // Verificar que la comida pertenece al usuario
    const [existing] = await pool.promise().query(
      "SELECT id_meal FROM meals WHERE id_meal = ? AND id_user = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comida no encontrada",
      });
    }

    await pool.promise().query(
      `UPDATE meals 
       SET name = ?, calories = ?, protein = ?, carbs = ?, fats = ?, image_url = NULL, icon = ?
       WHERE id_meal = ? AND id_user = ?`,
      [name, calories, protein, carbs, fats, icon || 'UtensilsCrossed', id, userId]
    );

    return res.json({
      success: true,
      message: "Comida actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en updateMeal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar comida",
    });
  }
};

// Eliminar comida
const deleteMeal = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const { id } = req.params;

    // Verificar que la comida pertenece al usuario
    const [existing] = await pool.promise().query(
      "SELECT id_meal FROM meals WHERE id_meal = ? AND id_user = ?",
      [id, userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comida no encontrada",
      });
    }

    await pool.promise().query(
      "DELETE FROM meals WHERE id_meal = ? AND id_user = ?",
      [id, userId]
    );

    return res.json({
      success: true,
      message: "Comida eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteMeal:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar comida",
    });
  }
};

module.exports = {
  getUserMeals,
  createMeal,
  updateMeal,
  deleteMeal,
};
