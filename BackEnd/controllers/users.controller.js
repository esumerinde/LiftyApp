// controllers/users.controller.js
const { pool } = require("../config/database");
const bcrypt = require("bcryptjs");

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const [rows] = await pool
      .promise()
      .query(
        "SELECT id_user, full_name, email, role, status, created_at, avatar_url FROM users"
      );

    return res.json(rows);
  } catch (err) {
    console.error("Error en getAllUsers:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool
      .promise()
      .query(
        "SELECT id_user, full_name, email, role, status, created_at, avatar_url, id_branch FROM users WHERE id_user = ?",
        [id]
      );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (err) {
    console.error("Error en getUserById:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Actualizar usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, email, role, status, id_branch } = req.body;

    const [result] = await pool
      .promise()
      .query(
        "UPDATE users SET full_name = ?, email = ?, role = ?, status = ?, id_branch = ? WHERE id_user = ?",
        [full_name, email, role, status, id_branch, id]
      );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: "Usuario actualizado exitosamente" });
  } catch (err) {
    console.error("Error en updateUser:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool
      .promise()
      .query("DELETE FROM users WHERE id_user = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json({ message: "Usuario eliminado exitosamente" });
  } catch (err) {
    console.error("Error en deleteUser:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    const [rows] = await pool
      .promise()
      .query("SELECT password FROM users WHERE id_user = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];
    if (!user.password) {
      return res.status(400).json({ message: "Usuario registrado con Google" });
    }

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) {
      return res.status(401).json({ message: "Contraseña actual incorrecta" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await pool
      .promise()
      .query("UPDATE users SET password = ? WHERE id_user = ?", [hashed, id]);

    return res.json({ message: "Contraseña actualizada exitosamente" });
  } catch (err) {
    console.error("Error en changePassword:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener perfil completo del usuario autenticado
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id_user;

    // Obtener datos del usuario con estadísticas y perfil físico
    const [userRows] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.email,
        u.avatar_url,
        u.bio,
        u.role,
        u.created_at,
        p.gender,
        p.birth_date,
        p.height_cm,
        p.current_weight_kg,
        p.target_weight_kg,
        p.lifestyle,
        p.diet_preference,
        p.main_goal,
        p.meal_frequency,
        COALESCE((SELECT COUNT(*) FROM workout_logs WHERE id_user = u.id_user), 0) as workouts_count,
        COALESCE((SELECT COUNT(*) FROM follows WHERE followed_id = u.id_user), 0) as followers_count,
        COALESCE((SELECT COUNT(*) FROM follows WHERE follower_id = u.id_user), 0) as following_count,
        COALESCE((SELECT COUNT(*) > 0 FROM subscriptions WHERE id_user = u.id_user AND status = 'active' AND end_date > NOW()), 0) as is_premium
      FROM users u
      LEFT JOIN user_profiles p ON u.id_user = p.id_user
      WHERE u.id_user = ?
    `,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(userRows[0]);
  } catch (err) {
    console.error("Error en getMyProfile:", err);
    console.error("Stack:", err.stack);
    return res
      .status(500)
      .json({ message: "Error interno", error: err.message });
  }
};

// Actualizar perfil del usuario autenticado
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const {
      full_name,
      username,
      bio,
      avatar_url,
      email,
      gender,
      weight,
      height,
      lifestyle,
      diet_preference,
      main_goal,
      meal_frequency,
    } = req.body;

    // Si se está cambiando el username, verificar que no esté en uso
    if (username) {
      const [existingUser] = await pool
        .promise()
        .query(
          "SELECT id_user FROM users WHERE username = ? AND id_user != ?",
          [username, userId]
        );

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ message: "El nombre de usuario ya está en uso" });
      }
    }

    // Actualizar tabla users
    const userUpdates = [];
    const userValues = [];

    if (full_name !== undefined) {
      userUpdates.push("full_name = ?");
      userValues.push(full_name);
    }
    if (username !== undefined) {
      userUpdates.push("username = ?");
      userValues.push(username);
    }
    if (bio !== undefined) {
      userUpdates.push("bio = ?");
      userValues.push(bio);
    }
    if (avatar_url !== undefined) {
      userUpdates.push("avatar_url = ?");
      userValues.push(avatar_url);
    }
    if (email !== undefined) {
      userUpdates.push("email = ?");
      userValues.push(email);
    }

    if (userUpdates.length > 0) {
      userValues.push(userId);
      await pool
        .promise()
        .query(
          `UPDATE users SET ${userUpdates.join(", ")} WHERE id_user = ?`,
          userValues
        );
    }

    // Actualizar tabla user_profiles
    const profileUpdates = [];
    const profileValues = [];

    if (gender !== undefined) {
      profileUpdates.push("gender = ?");
      // Si gender es vacío, usar NULL en lugar de cadena vacía
      profileValues.push(gender === "" ? null : gender);
    }
    if (weight !== undefined) {
      profileUpdates.push("current_weight_kg = ?");
      // Convertir a número o NULL si es vacío/inválido
      const weightValue = weight === "" || weight === null ? null : parseFloat(weight);
      profileValues.push(isNaN(weightValue) ? null : weightValue);
    }
    if (height !== undefined) {
      profileUpdates.push("height_cm = ?");
      // Convertir a número o NULL si es vacío/inválido
      const heightValue = height === "" || height === null ? null : parseFloat(height);
      profileValues.push(isNaN(heightValue) ? null : heightValue);
    }
    if (lifestyle !== undefined) {
      profileUpdates.push("lifestyle = ?");
      profileValues.push(lifestyle === "" ? null : lifestyle);
    }
    if (diet_preference !== undefined) {
      profileUpdates.push("diet_preference = ?");
      profileValues.push(diet_preference === "" ? null : diet_preference);
    }
    if (main_goal !== undefined) {
      profileUpdates.push("main_goal = ?");
      profileValues.push(main_goal === "" ? null : main_goal);
    }
    if (meal_frequency !== undefined) {
      profileUpdates.push("meal_frequency = ?");
      // Convertir a número o NULL si es vacío/inválido
      const mealFreqValue = meal_frequency === "" || meal_frequency === null ? null : parseInt(meal_frequency);
      profileValues.push(isNaN(mealFreqValue) ? null : mealFreqValue);
    }

    if (profileUpdates.length > 0) {
      profileValues.push(userId);

      // Verificar si existe el perfil
      const [profileExists] = await pool
        .promise()
        .query("SELECT id_user FROM user_profiles WHERE id_user = ?", [userId]);

      if (profileExists.length > 0) {
        // Actualizar perfil existente
        await pool
          .promise()
          .query(
            `UPDATE user_profiles SET ${profileUpdates.join(
              ", "
            )}, updated_at = NOW() WHERE id_user = ?`,
            profileValues
          );
      } else {
        // Crear perfil si no existe
        const fields = [
          "id_user",
          ...profileUpdates.map((u) => u.split(" = ")[0]),
        ];
        const placeholders = fields.map(() => "?").join(", ");
        await pool
          .promise()
          .query(
            `INSERT INTO user_profiles (${fields.join(
              ", "
            )}, updated_at) VALUES (${placeholders}, NOW())`,
            [userId, ...profileValues.slice(0, -1)]
          );
      }
    }

    // Obtener el perfil actualizado completo
    const [updatedUser] = await pool.promise().query(
      `SELECT 
          u.id_user, u.full_name, u.username, u.email, u.avatar_url, u.bio, u.role,
          p.gender, p.birth_date, p.height_cm, p.current_weight_kg, p.target_weight_kg,
          p.lifestyle, p.diet_preference, p.main_goal, p.meal_frequency
        FROM users u
        LEFT JOIN user_profiles p ON u.id_user = p.id_user
        WHERE u.id_user = ?`,
      [userId]
    );

    return res.json({
      message: "Perfil actualizado exitosamente",
      user: updatedUser[0],
    });
  } catch (err) {
    console.error("Error en updateMyProfile:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Verificar disponibilidad de username
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    const userId = req.user?.id_user;

    if (!username) {
      return res.status(400).json({ message: "Username es requerido" });
    }

    const [rows] = await pool
      .promise()
      .query(
        userId
          ? "SELECT id_user FROM users WHERE username = ? AND id_user != ?"
          : "SELECT id_user FROM users WHERE username = ?",
        userId ? [username, userId] : [username]
      );

    return res.json({ available: rows.length === 0 });
  } catch (err) {
    console.error("Error en checkUsernameAvailability:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener usuario por username (perfil público)
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id_user;

    const [userRows] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.email,
        u.avatar_url,
        u.bio,
        u.created_at,
        (SELECT COUNT(*) FROM workout_logs WHERE id_user = u.id_user) as workouts_count,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id_user) as followers_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = u.id_user) as following_count,
        (SELECT COUNT(*) > 0 FROM subscriptions WHERE id_user = u.id_user AND status = 'active' AND end_date > NOW()) as is_premium,
        CASE WHEN ? IS NOT NULL THEN
          (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user)
        ELSE 0 END as is_following
      FROM users u
      WHERE u.username = ? AND u.status = 'active'
    `,
      [currentUserId, currentUserId, username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(userRows[0]);
  } catch (err) {
    console.error("Error en getUserByUsername:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Buscar usuarios
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user?.id_user;

    // Si no hay query o está vacía, devolver todos los usuarios activos
    if (!q || q.trim().length === 0) {
      const [users] = await pool.promise().query(
        `
        SELECT 
          u.id_user,
          u.full_name,
          u.username,
          u.avatar_url,
          u.bio,
          (SELECT COUNT(*) FROM follows WHERE followed_id = u.id_user) as followers_count,
          (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user) as is_following
        FROM users u
        WHERE u.status = 'active' 
          AND u.id_user != ?
        ORDER BY followers_count DESC
      `,
        [currentUserId, currentUserId]
      );

      return res.json(users);
    }

    const searchTerm = `%${q.trim()}%`;

    const [users] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.avatar_url,
        u.bio,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id_user) as followers_count,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user) as is_following
      FROM users u
      WHERE (u.username LIKE ? OR u.full_name LIKE ?) 
        AND u.status = 'active'
        AND u.id_user != ?
      ORDER BY followers_count DESC
      LIMIT 20
    `,
      [currentUserId, searchTerm, searchTerm, currentUserId]
    );

    return res.json(users);
  } catch (err) {
    console.error("Error en searchUsers:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Seguir usuario
const followUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id_user;

    // No puede seguirse a sí mismo
    if (parseInt(userId) === followerId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    // Verificar que el usuario a seguir existe
    const [targetUser] = await pool
      .promise()
      .query(
        "SELECT id_user FROM users WHERE id_user = ? AND status = 'active'",
        [userId]
      );

    if (targetUser.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si ya lo sigue
    const [existing] = await pool
      .promise()
      .query(
        "SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?",
        [followerId, userId]
      );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Ya sigues a este usuario" });
    }

    // Crear la relación de seguimiento
    await pool
      .promise()
      .query(
        "INSERT INTO follows (follower_id, followed_id, created_at) VALUES (?, ?, NOW())",
        [followerId, userId]
      );

    return res.json({ message: "Usuario seguido exitosamente" });
  } catch (err) {
    console.error("Error en followUser:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Dejar de seguir usuario
const unfollowUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id_user;

    const [result] = await pool
      .promise()
      .query("DELETE FROM follows WHERE follower_id = ? AND followed_id = ?", [
        followerId,
        userId,
      ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "No sigues a este usuario" });
    }

    return res.json({ message: "Dejaste de seguir al usuario" });
  } catch (err) {
    console.error("Error en unfollowUser:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Verificar si el usuario autenticado sigue a otro usuario
const checkFollowStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const followerId = req.user.id_user;

    const [rows] = await pool
      .promise()
      .query(
        "SELECT * FROM follows WHERE follower_id = ? AND followed_id = ?",
        [followerId, userId]
      );

    return res.json({ isFollowing: rows.length > 0 });
  } catch (err) {
    console.error("Error en checkFollowStatus:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener seguidores de un usuario
const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id_user;

    const [followers] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.avatar_url,
        u.bio,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user) as is_following
      FROM follows uf
      JOIN users u ON uf.follower_id = u.id_user
      WHERE uf.followed_id = ? AND u.status = 'active'
      ORDER BY uf.created_at DESC
    `,
      [currentUserId, userId]
    );

    return res.json(followers);
  } catch (err) {
    console.error("Error en getUserFollowers:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener usuarios seguidos
const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.id_user;

    const [following] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.avatar_url,
        u.bio,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user) as is_following
      FROM follows uf
      JOIN users u ON uf.followed_id = u.id_user
      WHERE uf.follower_id = ? AND u.status = 'active'
      ORDER BY uf.created_at DESC
    `,
      [currentUserId, userId]
    );

    return res.json(following);
  } catch (err) {
    console.error("Error en getUserFollowing:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener usuarios por rol (trainer, nutritionist)
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const currentUserId = req.user?.id_user;

    if (!["trainer", "nutritionist"].includes(role)) {
      return res
        .status(400)
        .json({ message: "Rol inválido. Use 'trainer' o 'nutritionist'" });
    }

    const [users] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.full_name,
        u.username,
        u.avatar_url,
        u.bio,
        u.role,
        (SELECT COUNT(*) FROM follows WHERE followed_id = u.id_user) as followers_count,
        CASE WHEN ? IS NOT NULL THEN
          (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = u.id_user)
        ELSE 0 END as is_following
      FROM users u
      WHERE u.role = ? AND u.status = 'active'
      ORDER BY followers_count DESC
    `,
      [currentUserId, currentUserId, role]
    );

    // Convertir is_following de 0/1 a boolean
    const usersWithFollowStatus = users.map(user => ({
      ...user,
      is_following: Boolean(user.is_following)
    }));

    return res.json(usersWithFollowStatus);
  } catch (err) {
    console.error("Error en getUsersByRole:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener estadísticas de usuario (duración, volumen, reps)
const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "duration" } = req.query;

    // Validar tipo
    if (!["duration", "volume", "reps"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Tipo inválido. Use: duration, volume o reps",
      });
    }

    // Calcular fecha de hace 1 semana
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const startDate = oneWeekAgo.toISOString().split("T")[0];

    let query;
    let queryParams = [id, startDate];

    if (type === "duration") {
      // Duración: Suma de duration_minutes por fecha
      query = `
        SELECT 
          DATE(log_date) as date,
          SUM(duration_minutes) as value
        FROM workout_logs
        WHERE id_user = ? AND log_date >= ?
        GROUP BY DATE(log_date)
        ORDER BY date ASC
      `;
    } else if (type === "volume") {
      // Volumen: Suma de (weight_kg * reps) por fecha
      query = `
        SELECT 
          DATE(wl.log_date) as date,
          SUM(wls.weight_kg * wls.reps) as value
        FROM workout_logs wl
        INNER JOIN workout_log_exercises wle ON wl.id_log = wle.id_log
        INNER JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
        WHERE wl.id_user = ? 
          AND wl.log_date >= ?
          AND wls.completed = 1
        GROUP BY DATE(wl.log_date)
        ORDER BY date ASC
      `;
    } else if (type === "reps") {
      // Reps: Suma de reps por fecha
      query = `
        SELECT 
          DATE(wl.log_date) as date,
          SUM(wls.reps) as value
        FROM workout_logs wl
        INNER JOIN workout_log_exercises wle ON wl.id_log = wle.id_log
        INNER JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
        WHERE wl.id_user = ? 
          AND wl.log_date >= ?
          AND wls.completed = 1
        GROUP BY DATE(wl.log_date)
        ORDER BY date ASC
      `;
    }

    const [rows] = await pool.promise().query(query, queryParams);

    // Formatear datos para el frontend
    const data = rows.map((row) => ({
      date: row.date,
      value: parseFloat(row.value) || 0,
    }));

    return res.json({
      success: true,
      data: data,
      type: type,
      period: "1 semana",
    });
  } catch (err) {
    console.error("Error en getUserStats:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    });
  }
};

module.exports = {
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
};
