// index.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// Inicializar passport strategies (Google)
require("./config/passport-setup");

const { pool } = require("./config/database");

// Importar rutas
const routesAuth = require("./routes/auth.route");
const routesUsers = require("./routes/users.route");
const routesExercises = require("./routes/exercises.route");
const routesRoutines = require("./routes/routines.route");
const routesSubscriptions = require("./routes/subscriptions.route");
const routesNotifications = require("./routes/notifications.route");
const routesVerification = require("./routes/verification.route");
const routesWorkoutLogs = require("./routes/workoutLogs.route");
const routesMessages = require("./routes/messages.route");
const routesDailyGoals = require("./routes/dailyGoals.route");
const routesMeals = require("./routes/meals.route");
const routesConsumedMeals = require("./routes/consumedMeals.route");
const routesPasswordReset = require("./routes/passwordReset.route");
const routesDiets = require("./routes/diets.route");

const app = express();

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Rutas
app.use("/api", routesAuth);
app.use("/api", routesUsers);
app.use("/api", routesExercises);
app.use("/api", routesRoutines);
app.use("/api", routesSubscriptions);
app.use("/api", routesNotifications);
app.use("/api", routesVerification);
app.use("/api", routesWorkoutLogs);
app.use("/api/messages", routesMessages);
app.use("/api", routesDailyGoals);
app.use("/api", routesMeals);
app.use("/api/consumed-meals", routesConsumedMeals);
app.use("/api/password-reset", routesPasswordReset);
app.use("/api", routesDiets);

// Health check
app.get("/health", (_req, res) =>
  res.json({ ok: true, message: "LiftyApp API is running" })
);

// 404
app.use((req, res) => res.status(404).json({ message: "Ruta no encontrada" }));

// Error handler
app.use((err, _req, res, _next) => {
  console.error("Error no controlado:", err);
  res.status(err.status || 500).json({ message: "Error interno del servidor" });
});

// Conectar DB y arrancar servidor
pool.getConnection((err, conn) => {
  if (err) {
    console.error("❌ Error conectando a la DB:", err);
    process.exit(1);
  }
  console.log("✅ Conectado a la base de datos LiftyApp");
  conn.release();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 LiftyApp API escuchando en http://localhost:${PORT}`);
    console.log(
      `📚 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:5174"}`
    );
  });
});
