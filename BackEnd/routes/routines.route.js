// routes/routines.route.js
const express = require("express");
const {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getMyRoutines,
  getFeaturedRoutines,
  getSavedRoutines,
  saveRoutine,
  removeSavedRoutine,
  generateRoutine,
} = require("../controllers/routines.controller");
const {
  verificarToken,
  verificarRol,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas públicas
router.get("/routines/featured", getFeaturedRoutines);
router.get("/routines/:id", getRoutineById);
router.get("/routines", getAllRoutines);

// Rutas protegidas
router.get("/my-routines", verificarToken, getMyRoutines);
router.get("/saved-routines", verificarToken, getSavedRoutines);
router.post("/routines/generate", verificarToken, generateRoutine);
router.post("/routines/:id/save", verificarToken, saveRoutine);
router.delete("/routines/:id/save", verificarToken, removeSavedRoutine);
router.post("/routines", verificarToken, createRoutine); // Permitir a todos los usuarios crear rutinas
router.put(
  "/routines/:id",
  verificarToken,
  verificarRol("admin", "trainer"),
  updateRoutine
);
router.delete(
  "/routines/:id",
  verificarToken,
  verificarRol("admin", "trainer"),
  deleteRoutine
);

module.exports = router;
