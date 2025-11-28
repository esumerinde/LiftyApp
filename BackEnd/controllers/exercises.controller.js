// controllers/exercises.controller.js
const { pool } = require("../config/database");

// Obtener todos los ejercicios (con filtro opcional por grupo muscular)
const getAllExercises = async (req, res) => {
  try {
    const { muscleGroupId } = req.query;
    
    let query = `
      SELECT e.*, mg.name AS muscle_group_name, mg.image_url AS muscle_group_image
      FROM exercises e
      LEFT JOIN muscle_groups mg ON e.id_muscle_group = mg.id_muscle_group
    `;
    
    const params = [];
    
    if (muscleGroupId) {
      query += ` WHERE e.id_muscle_group = ?`;
      params.push(muscleGroupId);
    }
    
    query += ` ORDER BY e.name`;
    
    const [rows] = await pool.promise().query(query, params);
    
    return res.json(rows);
  } catch (err) {
    console.error("Error en getAllExercises:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener ejercicio por ID
const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM exercises WHERE id_exercise = ?", [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error en getExerciseById:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Crear ejercicio
const createExercise = async (req, res) => {
  try {
    const { name, description, video_url, muscle_group, equipment, difficulty } = req.body;

    if (!name || !muscle_group) {
      return res.status(400).json({ message: "Nombre y grupo muscular son requeridos" });
    }

    const [result] = await pool
      .promise()
      .query(
        `INSERT INTO exercises (name, description, video_url, muscle_group, equipment, difficulty)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, description, video_url, muscle_group, equipment, difficulty || 'beginner']
      );

    return res.status(201).json({
      message: "Ejercicio creado exitosamente",
      id_exercise: result.insertId,
    });
  } catch (err) {
    console.error("Error en createExercise:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Actualizar ejercicio
const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, video_url, muscle_group, equipment, difficulty } = req.body;

    const [result] = await pool
      .promise()
      .query(
        `UPDATE exercises 
         SET name = ?, description = ?, video_url = ?, muscle_group = ?, equipment = ?, difficulty = ?
         WHERE id_exercise = ?`,
        [name, description, video_url, muscle_group, equipment, difficulty, id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    return res.json({ message: "Ejercicio actualizado exitosamente" });
  } catch (err) {
    console.error("Error en updateExercise:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Eliminar ejercicio
const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool
      .promise()
      .query("DELETE FROM exercises WHERE id_exercise = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Ejercicio no encontrado" });
    }

    return res.json({ message: "Ejercicio eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteExercise:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener todos los grupos musculares
const getMuscleGroups = async (req, res) => {
  try {
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM muscle_groups ORDER BY name");
    
    return res.json(rows);
  } catch (err) {
    console.error("Error en getMuscleGroups:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Filtrar ejercicios por grupo muscular
const getExercisesByMuscleGroup = async (req, res) => {
  try {
    const { muscle_group_id } = req.params;
    const [rows] = await pool
      .promise()
      .query("SELECT * FROM exercises WHERE id_muscle_group = ? ORDER BY name", [muscle_group_id]);
    
    return res.json(rows);
  } catch (err) {
    console.error("Error en getExercisesByMuscleGroup:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

module.exports = {
  getAllExercises,
  getExerciseById,
  createExercise,
  updateExercise,
  deleteExercise,
  getMuscleGroups,
  getExercisesByMuscleGroup,
};
