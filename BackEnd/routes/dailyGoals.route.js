// routes/dailyGoals.route.js
const express = require("express");
const {
  getUserDailyGoals,
  updateUserDailyGoals,
  addWater,
  resetWater,
  getDailyGoalsByDate,
  saveDailySnapshot,
} = require("../controllers/dailyGoals.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/daily-goals", verificarToken, getUserDailyGoals);
router.put("/daily-goals", verificarToken, updateUserDailyGoals);
router.post("/daily-goals/water", verificarToken, addWater);
router.delete("/daily-goals/water", verificarToken, resetWater);
router.get("/daily-goals/by-date", verificarToken, getDailyGoalsByDate);
router.post("/daily-goals/snapshot", verificarToken, saveDailySnapshot);

module.exports = router;
