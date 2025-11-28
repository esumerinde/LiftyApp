// routes/meals.route.js
const express = require("express");
const {
  getUserMeals,
  createMeal,
  updateMeal,
  deleteMeal,
} = require("../controllers/meals.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/meals", verificarToken, getUserMeals);
router.post("/meals", verificarToken, createMeal);
router.put("/meals/:id", verificarToken, updateMeal);
router.delete("/meals/:id", verificarToken, deleteMeal);

module.exports = router;
