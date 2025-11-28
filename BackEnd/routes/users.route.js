// routes/users.route.js
const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  getMyProfile,
  updateMyProfile,
  checkUsernameAvailability,
  getUserByUsername,
  searchUsers,
  followUser,
  unfollowUser,
  checkFollowStatus,
  getUserFollowers,
  getUserFollowing,
  getUsersByRole,
  getUserStats,
} = require("../controllers/users.controller");
const {
  verificarToken,
  verificarRol,
} = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas de perfil del usuario autenticado
router.get("/profile", verificarToken, getMyProfile);
router.put("/profile", verificarToken, updateMyProfile);
router.get(
  "/profile/check-username",
  verificarToken,
  checkUsernameAvailability
);

// Rutas públicas de usuarios (búsqueda y perfiles)
router.get("/search", verificarToken, searchUsers);
router.get("/role/:role", verificarToken, getUsersByRole);
router.get("/username/:username", verificarToken, getUserByUsername);

// Rutas de seguimiento
router.post("/:userId/follow", verificarToken, followUser);
router.delete("/:userId/follow", verificarToken, unfollowUser);
router.get("/:userId/follow-status", verificarToken, checkFollowStatus);
router.get("/:userId/followers", verificarToken, getUserFollowers);
router.get("/:userId/following", verificarToken, getUserFollowing);

// Ruta de estadísticas
router.get("/:id/stats", verificarToken, getUserStats);

// Obtener todos los usuarios (solo admin)
router.get("/users", verificarToken, verificarRol("admin"), getAllUsers);

// Obtener usuario por ID
router.get("/users/:id", verificarToken, getUserById);

// Actualizar usuario
router.put("/users/:id", verificarToken, updateUser);

// Eliminar usuario (solo admin)
router.delete("/users/:id", verificarToken, verificarRol("admin"), deleteUser);

// Cambiar contraseña
router.put("/users/:id/password", verificarToken, changePassword);

module.exports = router;
