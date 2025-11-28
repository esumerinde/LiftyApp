// routes/diets.route.js
const express = require("express");
const {
  getUserDiets,
  getDietById,
  createDiet,
  updateDiet,
  deleteDiet,
  addMealToDiet,
  removeMealFromDiet,
  activateDiet,
} = require("../controllers/diets.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verificarToken);

// CRUD de dietas
router.get("/diets", getUserDiets);
router.get("/diets/:id", getDietById);
router.post("/diets", createDiet);
router.put("/diets/:id", updateDiet);
router.delete("/diets/:id", deleteDiet);

// Agregar/quitar comidas de una dieta
router.post("/diets/:id/meals", addMealToDiet);
router.delete("/diets/:id/meals/:mealId", removeMealFromDiet);

// Activar dieta (aplicar a metas diarias)
router.post("/diets/:id/activate", activateDiet);

module.exports = router;
