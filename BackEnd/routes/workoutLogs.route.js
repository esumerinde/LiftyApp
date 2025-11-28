// routes/workoutLogs.route.js
const express = require("express");
const {
  getWorkoutFeed,
  getMyWorkoutLogs,
  getUserWorkoutLogs,
  getFollowingWorkouts,
  getWorkoutLogById,
  createWorkoutLog,
  likeWorkout,
  addComment,
  getComments,
  deleteComment,
  getWorkoutLogExercises,
  getWorkoutLikes,
} = require("../controllers/workoutLogs.controller");
const { verificarToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas protegidas - IMPORTANTE: Rutas específicas ANTES de rutas con parámetros
router.get("/workout-logs/feed", verificarToken, getWorkoutFeed);
router.get("/workout-logs/my-logs", verificarToken, getMyWorkoutLogs);
router.get("/workout-logs/following", verificarToken, getFollowingWorkouts);
router.get("/workout-logs/user/:userId", verificarToken, getUserWorkoutLogs);
router.get(
  "/workout-logs/:id/exercises",
  verificarToken,
  getWorkoutLogExercises
);
router.get("/workout-logs/:id/likes", verificarToken, getWorkoutLikes);
router.get("/workout-logs/:id/comments", verificarToken, getComments);
router.post("/workout-logs", verificarToken, createWorkoutLog);
router.post("/workout-logs/:id/like", verificarToken, likeWorkout);
router.post("/workout-logs/:id/comments", verificarToken, addComment);
router.delete(
  "/workout-logs/comments/:commentId",
  verificarToken,
  deleteComment
);

// Esta ruta DEBE ir al FINAL porque matchea cualquier cosa
router.get("/workout-logs/:id", verificarToken, getWorkoutLogById);

module.exports = router;
