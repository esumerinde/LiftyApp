// routes/subscriptions.route.js
const express = require("express");
const { 
  getAllSubscriptions, 
  getMySubscription, 
  createSubscription, 
  updateSubscription,
  cancelSubscription 
} = require("../controllers/subscriptions.controller");
const { verificarToken, verificarRol } = require("../middlewares/authMiddleware");

const router = express.Router();

// Rutas protegidas
router.get("/subscriptions", verificarToken, verificarRol("admin"), getAllSubscriptions);
router.get("/my-subscription", verificarToken, getMySubscription);
router.post("/subscriptions", verificarToken, verificarRol("admin"), createSubscription);
router.put("/subscriptions/:id", verificarToken, verificarRol("admin"), updateSubscription);
router.put("/subscriptions/:id/cancel", verificarToken, cancelSubscription);

module.exports = router;
