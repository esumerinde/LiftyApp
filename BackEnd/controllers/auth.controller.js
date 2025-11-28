// controllers/auth.controller.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5174";
const JWT_SECRET = process.env.JWT_SECRET || "liftyapp_secret_key_2024";
const JWT_EXPIRES_IN = "7d";

// Comidas básicas que se asignan a cada nuevo usuario
const DEFAULT_MEALS = [
  { name: 'Pechuga de Pollo 100g', calories: 165, protein: 31, carbs: 0, fats: 4, icon: 'Drumstick' },
  { name: 'Pechuga de Pollo 200g', calories: 330, protein: 62, carbs: 0, fats: 8, icon: 'Drumstick' },
  { name: 'Huevos x2', calories: 156, protein: 13, carbs: 1, fats: 11, icon: 'Egg' },
  { name: 'Huevos x3', calories: 234, protein: 19, carbs: 2, fats: 16, icon: 'Egg' },
  { name: 'Atún en Lata 150g', calories: 150, protein: 33, carbs: 0, fats: 1, icon: 'Fish' },
  { name: 'Carne Vacuna 150g', calories: 375, protein: 38, carbs: 0, fats: 24, icon: 'Beef' },
  { name: 'Leche 200ml', calories: 130, protein: 7, carbs: 10, fats: 8, icon: 'Milk' },
  { name: 'Leche 400ml', calories: 260, protein: 14, carbs: 20, fats: 16, icon: 'Milk' },
  { name: 'Yogur Griego 150g', calories: 135, protein: 15, carbs: 8, fats: 4, icon: 'Milk' },
  { name: 'Manzana Mediana', calories: 95, protein: 0, carbs: 25, fats: 0, icon: 'Apple' },
  { name: 'Banana 50g', calories: 45, protein: 1, carbs: 12, fats: 0, icon: 'Banana' },
  { name: 'Banana 100g', calories: 90, protein: 1, carbs: 23, fats: 0, icon: 'Banana' },
  { name: 'Arroz Blanco 100g', calories: 130, protein: 3, carbs: 28, fats: 0, icon: 'UtensilsCrossed' },
  { name: 'Avena 50g', calories: 190, protein: 7, carbs: 34, fats: 4, icon: 'Cookie' },
  { name: 'Pan Integral x2 rebanadas', calories: 160, protein: 8, carbs: 28, fats: 2, icon: 'Croissant' },
];

// Función para crear comidas básicas para un nuevo usuario
const createDefaultMeals = async (userId) => {
  try {
    const insertPromises = DEFAULT_MEALS.map(meal => {
      return pool.promise().query(
        `INSERT INTO meals (id_user, name, calories, protein, carbs, fats, icon, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
        [userId, meal.name, meal.calories, meal.protein, meal.carbs, meal.fats, meal.icon]
      );
    });

    await Promise.all(insertPromises);
    console.log(`✅ ${DEFAULT_MEALS.length} comidas básicas creadas para usuario ${userId}`);
  } catch (error) {
    console.error('❌ Error al crear comidas básicas:', error);
    // No lanzar error para no interrumpir el registro
  }
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
  });
};

// ========== REGISTER ==========
const register = async (req, res) => {
  const {
    email,
    full_name,
    username,
    password,
    // Datos del wizard QR (opcionales)
    gender,
    weight,
    height,
    lifestyle,
    diet,
    goal,
    meals,
  } = req.body;

  // Validaciones
  if (!email || !full_name || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Todos los campos son requeridos",
    });
  }

  // Validar longitud de contraseña
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "La contraseña debe tener al menos 8 caracteres",
    });
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Email inválido",
    });
  }

  // Validar username (solo letras, números, guiones bajos)
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      success: false,
      message:
        "El nombre de usuario debe tener entre 3-20 caracteres (solo letras, números y guiones bajos)",
    });
  }

  try {
    // Verificar que el email fue verificado
    const [verifications] = await pool
      .promise()
      .query(
        "SELECT * FROM email_verifications WHERE email = ? AND verified = TRUE ORDER BY created_at DESC LIMIT 1",
        [email]
      );

    if (verifications.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "El email no ha sido verificado. Por favor verifica tu email primero.",
      });
    }

    // Verificar si el email ya está registrado
    const [existingUsers] = await pool
      .promise()
      .query("SELECT id_user FROM users WHERE email = ?", [email]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Verificar si el username ya existe
    const [existingUsernames] = await pool
      .promise()
      .query("SELECT id_user FROM users WHERE username = ?", [username]);

    if (existingUsernames.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está en uso",
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [userResult] = await pool.promise().query(
      `INSERT INTO users (full_name, username, email, password, role, created_at) 
       VALUES (?, ?, ?, ?, 'user', NOW())`,
      [full_name, username, email, hashedPassword]
    );

    const userId = userResult.insertId;

    // Crear user_profile con datos del wizard (si existen)
    const profileQuery = gender
      ? `INSERT INTO user_profiles (
           id_user, 
           gender, 
           current_weight_kg, 
           height_cm, 
           lifestyle, 
           diet_preference, 
           main_goal, 
           meal_frequency, 
           updated_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`
      : `INSERT INTO user_profiles (id_user, updated_at) VALUES (?, NOW())`;

    const profileValues = gender
      ? [
          userId,
          gender, // 'male', 'female', 'other'
          weight || null, // current_weight_kg
          height || null, // height_cm
          lifestyle || null, // 'sedentary', 'light', 'moderate', 'active', 'very_active'
          diet || null, // 'omnivore', 'vegan', 'vegetarian', 'keto', 'low_carb'
          goal || null, // 'lose_weight', 'gain_muscle', 'get_toned', 'maintain'
          meals || 4, // meal_frequency (default 4)
        ]
      : [userId];

    await pool.promise().query(profileQuery, profileValues);

    // Crear comidas básicas para el nuevo usuario
    await createDefaultMeals(userId);

    // Limpiar códigos de verificación antiguos
    await pool
      .promise()
      .query("DELETE FROM email_verifications WHERE email = ?", [email]);

    // Generar token JWT
    const token = jwt.sign(
      {
        id_user: userId,
        email: email,
        username: username,
        role: "user",
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // NO guardar cookie en registro, solo en login
    // setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id_user: userId,
        full_name: full_name,
        username: username,
        email: email,
        role: "user",
      },
    });
  } catch (error) {
    console.error("❌ Error en registro:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar el usuario",
      error: error.message,
    });
  }
};

// ========== LOGIN ==========
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("🔐 Intento de login:", { email });

  // Validaciones
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña son requeridos",
    });
  }

  try {
    // Buscar usuario por email
    const [users] = await pool.promise().query(
      `SELECT u.id_user, u.full_name, u.username, u.email, u.password, u.role, u.avatar_url, u.status,
              p.id_profile
       FROM users u
       LEFT JOIN user_profiles p ON u.id_user = p.id_user
       WHERE u.email = ?`,
      [email]
    );

    console.log("📊 Usuarios encontrados:", users.length);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const user = users[0];
    console.log("👤 Usuario encontrado:", {
      id: user.id_user,
      email: user.email,
      role: user.role,
    });

    // Verificar si es cuenta de Google
    if (!user.password) {
      return res.status(403).json({
        success: false,
        message:
          "Esta cuenta está registrada con Google. Por favor usa ese método para iniciar sesión.",
      });
    }

    // Verificar si el usuario está activo
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tu cuenta ha sido desactivada. Contacta al soporte.",
      });
    }

    // Verificar contraseña
    let isPasswordValid;

    // Si la contraseña en BD no es un hash de bcrypt (no empieza con $2b$), comparar texto plano
    if (!user.password.startsWith("$2b$")) {
      isPasswordValid = password === user.password;
    } else {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }

    console.log("🔑 Password válido:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    // Generar JWT token
    const token = jwt.sign(
      {
        id_user: user.id_user,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setAuthCookie(res, token);

    console.log("✅ Login exitoso para:", user.email);

    // Respuesta exitosa (NO enviar password)
    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id_user: user.id_user,
        full_name: user.full_name,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
        id_profile: user.id_profile,
      },
    });
  } catch (error) {
    console.error("❌ Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error al iniciar sesión",
      error: error.message,
    });
  }
};

// Callback de Google
const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${FRONTEND_URL}/?auth=failed`);
    }

    const token = jwt.sign(
      {
        id_user: req.user.id_user,
        email: req.user.email,
        full_name: req.user.full_name,
        username: req.user.username || req.user.email.split("@")[0],
        role: req.user.role,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    setAuthCookie(res, token);
    // Redirigir a home después de login con Google
    return res.redirect(`${FRONTEND_URL}/?auth=success`);
  } catch (err) {
    console.error("Error en googleCallback:", err);
    return res.redirect(`${FRONTEND_URL}/?auth=failed`);
  }
};

// Logout
const logout = (_req, res) => {
  // Limpiar cookie con las mismas opciones con las que se creó
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  console.log("✅ Logout exitoso - Cookie eliminada");

  return res.json({
    success: true,
    message: "Logout exitoso",
  });
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.promise().query(
      `SELECT u.id_user, u.full_name, u.username, u.email, u.role, u.avatar_url, u.status, u.created_at,
                p.gender, p.birth_date, p.height_cm, p.current_weight_kg
         FROM users u
         LEFT JOIN user_profiles p ON u.id_user = p.id_user
         WHERE u.id_user = ?`,
      [req.user.id_user]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      success: true,
      user: rows[0],
    });
  } catch (err) {
    console.error("Error en getProfile:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno",
    });
  }
};

// ========== VERIFY TOKEN (Middleware/Helper) ==========
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token no proporcionado",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Agregar datos del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

// ========== GET CURRENT USER ==========
const getCurrentUser = async (req, res) => {
  const userId = req.user.id_user;

  try {
    const [users] = await pool.promise().query(
      `SELECT u.id_user, u.full_name, u.username, u.email, u.role, u.avatar_url,
              p.id_profile, p.gender, p.birth_date, p.height_cm, p.current_weight_kg
       FROM users u
       LEFT JOIN user_profiles p ON u.id_user = p.id_user
       WHERE u.id_user = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener datos del usuario",
      error: error.message,
    });
  }
};

// ========== CHECK EMAIL AVAILABILITY ==========
const checkEmailAvailability = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email es requerido",
    });
  }

  try {
    const [users] = await pool
      .promise()
      .query("SELECT id_user FROM users WHERE email = ?", [email]);

    return res.status(200).json({
      success: true,
      available: users.length === 0,
      message: users.length === 0 ? "Email disponible" : "Email ya está en uso",
    });
  } catch (error) {
    console.error("❌ Error al verificar email:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar disponibilidad del email",
    });
  }
};

// ========== CHECK USERNAME AVAILABILITY ==========
const checkUsernameAvailability = async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      success: false,
      message: "Username es requerido",
    });
  }

  try {
    const [users] = await pool
      .promise()
      .query("SELECT id_user FROM users WHERE username = ?", [username]);

    return res.status(200).json({
      success: true,
      available: users.length === 0,
      message:
        users.length === 0 ? "Username disponible" : "Username ya está en uso",
    });
  } catch (error) {
    console.error("❌ Error al verificar username:", error);
    return res.status(500).json({
      success: false,
      message: "Error al verificar disponibilidad del username",
    });
  }
};

module.exports = {
  register,
  login,
  googleCallback,
  logout,
  getProfile,
  verifyToken,
  getCurrentUser,
  checkEmailAvailability,
  checkUsernameAvailability,
  createDefaultMeals, // Exportar para uso en passport-setup
};
