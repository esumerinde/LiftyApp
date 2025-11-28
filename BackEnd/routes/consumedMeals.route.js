const express = require("express");
const router = express.Router();
const { verificarToken } = require("../middlewares/authMiddleware");
const {
  addConsumedMeal,
  getTodayConsumedMeals,
  deleteConsumedMeal,
  getConsumedMealsByDate,
} = require("../controllers/consumedMeals.controller");

// Agregar comida consumida
router.post("/", verificarToken, addConsumedMeal);

// Obtener comidas consumidas del día
router.get("/today", verificarToken, getTodayConsumedMeals);

// Obtener comidas consumidas por fecha
router.get("/by-date", verificarToken, getConsumedMealsByDate);

// Eliminar comida consumida
router.delete("/:id", verificarToken, deleteConsumedMeal);

module.exports = router;
