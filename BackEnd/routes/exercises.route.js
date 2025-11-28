// routes/exercises.route.js
const express = require("express");
const { 
  getAllExercises, 
  getExerciseById, 
  createExercise, 
  updateExercise, 
  deleteExercise,
  getMuscleGroups,
  getExercisesByMuscleGroup 
} = require("../controllers/exercises.controller");
const { verificarToken, verificarRol } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas públicas (orden importante: más específicas primero)
router.get("/muscle-groups", getMuscleGroups);
router.get("/muscle_groups", getMuscleGroups); // Alias for compatibility
router.get("/exercises/muscle-groups", getMuscleGroups); // Nested route
router.get("/exercises/muscle/:muscle_group_id", getExercisesByMuscleGroup);
router.get("/exercises/:id", getExerciseById);
router.get("/exercises", getAllExercises); // Soporta ?muscleGroupId=X para filtrar

// Rutas protegidas (solo trainers y admin)
router.post("/exercises", verificarToken, verificarRol("admin", "trainer"), createExercise);
router.put("/exercises/:id", verificarToken, verificarRol("admin", "trainer"), updateExercise);
router.delete("/exercises/:id", verificarToken, verificarRol("admin", "trainer"), deleteExercise);

module.exports = router;
