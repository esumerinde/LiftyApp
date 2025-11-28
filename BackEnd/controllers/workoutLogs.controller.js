// controllers/workoutLogs.controller.js
const { pool } = require("../config/database");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "liftyapp_secret_key_2024";

// Obtener feed de entrenamientos (todos los públicos para HUB)
const getWorkoutFeed = async (req, res) => {
  try {
    const userId = req.user?.id_user;

    // Query para obtener TODOS los workout logs públicos (para el HUB)
    const [logs] = await pool.promise().query(
      `
      SELECT 
        wl.id_log,
        wl.id_user,
        wl.id_routine,
        wl.log_date,
        wl.start_time,
        wl.end_time,
        wl.duration_minutes,
        wl.title,
        wl.description,
        wl.image_url,
        (SELECT COUNT(*) FROM workout_likes WHERE id_log = wl.id_log) AS likes_count,
        wl.rating,
        wl.visibility,
        wl.created_at,
        u.full_name,
        u.username,
        u.avatar_url,
        r.name AS routine_name,
        (SELECT COUNT(*) FROM workout_comments WHERE id_log = wl.id_log) AS comments_count,
        IF(wlikes.id_like IS NOT NULL, 1, 0) as user_liked,
        (SELECT COUNT(*) > 0 FROM follows WHERE follower_id = ? AND followed_id = wl.id_user) as is_following,
        latest_comment.id_comment as latest_comment_id,
        latest_comment.content as latest_comment_content,
        latest_comment.created_at as latest_comment_created_at,
        comment_user.id_user as latest_comment_user_id,
        comment_user.username as latest_comment_username,
        comment_user.full_name as latest_comment_full_name,
        comment_user.avatar_url as latest_comment_avatar_url,
        COALESCE((SELECT SUM(wls.weight_kg)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_weight_kg,
        COALESCE((SELECT SUM(wls.reps)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_reps
      FROM workout_logs wl
      JOIN users u ON wl.id_user = u.id_user
      LEFT JOIN routines r ON wl.id_routine = r.id_routine
      LEFT JOIN workout_likes wlikes ON wl.id_log = wlikes.id_log AND wlikes.id_user = ?
      LEFT JOIN (
        SELECT wc.id_log, wc.id_comment, wc.content, wc.created_at, wc.id_user
        FROM workout_comments wc
        INNER JOIN (
          SELECT id_log, MAX(created_at) as max_created
          FROM workout_comments
          GROUP BY id_log
        ) latest ON wc.id_log = latest.id_log AND wc.created_at = latest.max_created
      ) latest_comment ON wl.id_log = latest_comment.id_log
      LEFT JOIN users comment_user ON latest_comment.id_user = comment_user.id_user
      WHERE wl.visibility = 'public'
      ORDER BY COALESCE(wl.end_time, wl.log_date, wl.created_at) DESC
      LIMIT 50
    `,
      [userId, userId]
    );

    // Agrupar resultados por id_log para evitar duplicados causados por múltiples comentarios
    const groupedLogs = logs.reduce((acc, log) => {
      const existingLog = acc.find((l) => l.id_log === log.id_log);
      if (!existingLog) {
        acc.push(log);
      }
      return acc;
    }, []);

    return res.status(200).json({
      success: true,
      logs: groupedLogs,
    });
  } catch (error) {
    console.error("❌ Error al obtener feed:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener feed de entrenamientos",
      error: error.message,
    });
  }
};

// Obtener entrenamientos de usuarios seguidos
const getFollowingWorkouts = async (req, res) => {
  try {
    let userId = req.user?.id_user;

    if (!userId) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.id_user;
        } catch (error) {
          return res
            .status(403)
            .json({ success: false, message: "Token no válido" });
        }
      }
    }

    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "No autenticado" });
    }

    console.log("SEGUIDOS -> userId:", userId);

    // Query: mismos campos que el feed, pero filtrados por seguidos
    const [logs] = await pool.promise().query(
      `
      SELECT
        wl.id_log,
        wl.id_user,
        wl.id_routine,
        wl.log_date,
        wl.start_time,
        wl.end_time,
        wl.duration_minutes,
        wl.title,
        wl.description,
        wl.image_url,
        wl.rating,
        wl.visibility,
        wl.created_at,
        u.full_name,
        u.username,
        u.avatar_url,
        r.name AS routine_name,
        (SELECT COUNT(*) FROM workout_likes WHERE id_log = wl.id_log) AS likes_count,
        (SELECT COUNT(*) FROM workout_comments WHERE id_log = wl.id_log) AS comments_count,
        IF(EXISTS(
          SELECT 1 FROM workout_likes WHERE id_log = wl.id_log AND id_user = ?
        ), 1, 0) AS user_liked,
        1 AS is_following,
        COALESCE((
          SELECT SUM(wls.weight_kg)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1
        ), 0) AS total_weight_kg,
        COALESCE((
          SELECT SUM(wls.reps)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1
        ), 0) AS total_reps,
        latest_comment.id_comment AS latest_comment_id,
        latest_comment.content AS latest_comment_content,
        latest_comment.created_at AS latest_comment_created_at,
        comment_user.id_user AS latest_comment_user_id,
        comment_user.username AS latest_comment_username,
        comment_user.full_name AS latest_comment_full_name,
        comment_user.avatar_url AS latest_comment_avatar_url
      FROM workout_logs wl
      INNER JOIN follows f ON wl.id_user = f.followed_id AND f.follower_id = ?
      INNER JOIN users u ON wl.id_user = u.id_user
      LEFT JOIN routines r ON wl.id_routine = r.id_routine
      LEFT JOIN (
        SELECT wc.id_log, wc.id_comment, wc.content, wc.created_at, wc.id_user
        FROM workout_comments wc
        INNER JOIN (
          SELECT id_log, MAX(created_at) AS max_created
          FROM workout_comments
          GROUP BY id_log
        ) latest ON wc.id_log = latest.id_log AND wc.created_at = latest.max_created
      ) latest_comment ON wl.id_log = latest_comment.id_log
      LEFT JOIN users comment_user ON latest_comment.id_user = comment_user.id_user
      WHERE wl.visibility IN ('public', 'followers')
      ORDER BY wl.created_at DESC
      LIMIT 50
      `,
      [userId, userId]
    );

    console.log("SEGUIDOS -> logs encontrados:", logs.length);

    return res.status(200).json({ success: true, logs });
  } catch (error) {
    console.error("🚨 SEGUIDOS - ERROR:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener workout logs del usuario autenticado
const getMyWorkoutLogs = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [logs] = await pool.promise().query(
      `
      SELECT 
        wl.id_log,
        wl.id_user,
        wl.id_routine,
        wl.log_date,
        wl.start_time,
        wl.end_time,
        wl.duration_minutes,
        wl.title,
        wl.description,
        wl.image_url,
        (SELECT COUNT(*) FROM workout_likes WHERE id_log = wl.id_log) AS likes_count,
        wl.rating,
        wl.visibility,
        wl.created_at,
        r.name AS routine_name,
        (SELECT COUNT(*) FROM workout_comments WHERE id_log = wl.id_log) AS comments_count,
        IF(wlikes.id_like IS NOT NULL, 1, 0) as user_liked,
        u.full_name,
        u.username,
        u.avatar_url,
        latest_comment.id_comment as latest_comment_id,
        latest_comment.content as latest_comment_content,
        latest_comment.created_at as latest_comment_created_at,
        comment_user.id_user as latest_comment_user_id,
        comment_user.username as latest_comment_username,
        comment_user.full_name as latest_comment_full_name,
        comment_user.avatar_url as latest_comment_avatar_url,
        COALESCE((SELECT SUM(wls.weight_kg)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_weight_kg,
        COALESCE((SELECT SUM(wls.reps)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_reps
      FROM workout_logs wl
      LEFT JOIN routines r ON wl.id_routine = r.id_routine
      LEFT JOIN workout_likes wlikes ON wl.id_log = wlikes.id_log AND wlikes.id_user = ?
      JOIN users u ON wl.id_user = u.id_user
      LEFT JOIN (
        SELECT wc.id_log, wc.id_comment, wc.content, wc.created_at, wc.id_user
        FROM workout_comments wc
        INNER JOIN (
          SELECT id_log, MAX(created_at) as max_created
          FROM workout_comments
          GROUP BY id_log
        ) latest ON wc.id_log = latest.id_log AND wc.created_at = latest.max_created
      ) latest_comment ON wl.id_log = latest_comment.id_log
      LEFT JOIN users comment_user ON latest_comment.id_user = comment_user.id_user
      WHERE wl.id_user = ?
      ORDER BY COALESCE(wl.end_time, wl.log_date, wl.created_at) DESC
    `,
      [userId, userId]
    );

    // Agrupar resultados por id_log
    const groupedLogs = logs.reduce((acc, log) => {
      const existingLog = acc.find((l) => l.id_log === log.id_log);
      if (!existingLog) {
        acc.push(log);
      }
      return acc;
    }, []);

    return res.status(200).json({
      success: true,
      logs: groupedLogs,
    });
  } catch (error) {
    console.error("❌ Error al obtener mis entrenamientos:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener entrenamientos",
      error: error.message,
    });
  }
};

// Obtener workout log por ID
const getWorkoutLogById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("📋 Obteniendo workout log ID:", id);

    const [logs] = await pool.promise().query(
      `
      SELECT 
        wl.id_log,
        wl.id_user,
        wl.id_routine,
        wl.log_date,
        wl.start_time,
        wl.end_time,
        wl.duration_minutes,
        wl.title,
        wl.description,
        (SELECT COUNT(*) FROM workout_likes WHERE id_log = wl.id_log) AS likes_count,
        wl.rating,
        wl.visibility,
        wl.created_at,
        u.full_name,
        u.username,
        u.avatar_url,
        r.name AS routine_name,
        (SELECT COUNT(*) FROM workout_comments WHERE id_log = wl.id_log) AS comments_count,
        COALESCE(
          (SELECT SUM(wls.weight_kg * wls.reps) 
           FROM workout_log_exercises wle
           LEFT JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
           WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0
        ) AS total_weight_kg,
        COALESCE(
          (SELECT SUM(wls.reps) 
           FROM workout_log_exercises wle
           LEFT JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
           WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0
        ) AS total_reps
      FROM workout_logs wl
      JOIN users u ON wl.id_user = u.id_user
      LEFT JOIN routines r ON wl.id_routine = r.id_routine
      WHERE wl.id_log = ?
    `,
      [id]
    );

    if (logs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Entrenamiento no encontrado",
      });
    }

    console.log("✅ Workout log encontrado:", logs[0]);
    return res.status(200).json({
      success: true,
      log: logs[0],
    });
  } catch (error) {
    console.error("❌ Error al obtener workout log:", error);
    console.error("❌ Stack completo:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error al obtener entrenamiento",
      error: error.message,
    });
  }
};

// Crear workout log
const createWorkoutLog = async (req, res) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id_user;
    const {
      id_routine,
      log_date,
      start_time,
      end_time,
      duration_minutes,
      title,
      description,
      image_url,
      rating,
      visibility,
      exercises, // Array de ejercicios con sus sets
    } = req.body;

    // 1. Insertar workout log
    const [result] = await connection.query(
      `
      INSERT INTO workout_logs (
        id_user,
        id_routine,
        log_date,
        start_time,
        end_time,
        duration_minutes,
        title,
        description,
        image_url,
        rating,
        visibility
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        userId,
        id_routine || null,
        log_date || null,
        start_time || null,
        end_time || null,
        duration_minutes || null,
        title || null,
        description || null,
        image_url || null,
        rating || null,
        visibility || "public",
      ]
    );

    const idLog = result.insertId;

    // 2. Insertar ejercicios y sets si existen
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i];

        // Insertar ejercicio
        const idExercise = exercise.id_exercise || exercise.id;

        if (!idExercise) {
          console.warn("⚠️ Ejercicio sin ID:", exercise);
          continue;
        }

        const [exerciseResult] = await connection.query(
          `
          INSERT INTO workout_log_exercises (
            id_log,
            id_exercise,
            exercise_order,
            notes
          ) VALUES (?, ?, ?, ?)
        `,
          [idLog, idExercise, i, exercise.notes || null]
        );

        const idLogExercise = exerciseResult.insertId;

        // Insertar sets del ejercicio
        if (exercise.sets && Array.isArray(exercise.sets)) {
          for (let j = 0; j < exercise.sets.length; j++) {
            const set = exercise.sets[j];

            await connection.query(
              `
              INSERT INTO workout_log_sets (
                id_log_exercise,
                set_number,
                set_type,
                weight_kg,
                reps,
                completed
              ) VALUES (?, ?, ?, ?, ?, ?)
            `,
              [
                idLogExercise,
                j + 1,
                set.type || "N",
                set.kg || null,
                set.reps || null,
                set.done ? 1 : 0,
              ]
            );
          }
        }
      }
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Entrenamiento registrado exitosamente",
      id_log: idLog,
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error al crear workout log:", error);
    return res.status(500).json({
      success: false,
      message: "Error al registrar entrenamiento",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Dar like a un workout
const likeWorkout = async (req, res) => {
  const connection = await pool.promise().getConnection();

  try {
    await connection.beginTransaction();

    const userId = req.user.id_user;
    const { id } = req.params;

    // Verificar si el usuario ya dio like
    const [existingLike] = await connection.query(
      `
      SELECT id_like FROM workout_likes 
      WHERE id_log = ? AND id_user = ?
    `,
      [id, userId]
    );

    let liked;

    if (existingLike.length > 0) {
      // Ya dio like, entonces quitarlo
      await connection.query(
        `
        DELETE FROM workout_likes WHERE id_log = ? AND id_user = ?
      `,
        [id, userId]
      );

      liked = false;
    } else {
      // No ha dado like, agregarlo
      await connection.query(
        `
        INSERT INTO workout_likes (id_log, id_user) VALUES (?, ?)
      `,
        [id, userId]
      );

      liked = true;
    }

    // Obtener el conteo REAL desde workout_likes
    const [result] = await connection.query(
      `
      SELECT COUNT(*) as likes_count FROM workout_likes WHERE id_log = ?
    `,
      [id]
    );

    const newCount = result[0]?.likes_count || 0;

    await connection.commit();

    return res.status(200).json({
      success: true,
      liked,
      likes_count: newCount,
    });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error en toggle like:", error);
    return res.status(500).json({
      success: false,
      message: "Error al procesar like",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

// Agregar comentario
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id_user;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El contenido del comentario es requerido",
      });
    }

    const [result] = await pool.promise().query(
      `
      INSERT INTO workout_comments (id_log, id_user, content)
      VALUES (?, ?, ?)
    `,
      [id, userId, content.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Comentario agregado",
      id_comment: result.insertId,
    });
  } catch (error) {
    console.error("❌ Error al agregar comentario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al agregar comentario",
      error: error.message,
    });
  }
};

// Obtener comentarios de un workout
const getComments = async (req, res) => {
  try {
    const { id } = req.params;

    const [comments] = await pool.promise().query(
      `
      SELECT 
        wc.id_comment,
        wc.content,
        wc.created_at,
        u.id_user,
        u.full_name,
        u.username,
        u.avatar_url
      FROM workout_comments wc
      JOIN users u ON wc.id_user = u.id_user
      WHERE wc.id_log = ?
      ORDER BY wc.created_at ASC
    `,
      [id]
    );

    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("❌ Error al obtener comentarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener comentarios",
      error: error.message,
    });
  }
};

// Eliminar comentario
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id_user;

    // Verificar que el comentario existe y pertenece al usuario
    const [comment] = await pool.promise().query(
      `
      SELECT id_user FROM workout_comments WHERE id_comment = ?
    `,
      [commentId]
    );

    if (comment.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Comentario no encontrado",
      });
    }

    if (comment[0].id_user !== userId) {
      return res.status(403).json({
        success: false,
        message: "No tienes permiso para eliminar este comentario",
      });
    }

    // Eliminar el comentario
    await pool.promise().query(
      `
      DELETE FROM workout_comments WHERE id_comment = ?
    `,
      [commentId]
    );

    return res.status(200).json({
      success: true,
      message: "Comentario eliminado",
    });
  } catch (error) {
    console.error("❌ Error al eliminar comentario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar comentario",
      error: error.message,
    });
  }
};

// Obtener ejercicios de un workout log
const getWorkoutLogExercises = async (req, res) => {
  try {
    const { id } = req.params;

    const [exercises] = await pool.promise().query(
      `
      SELECT 
        wle.id_log_exercise,
        wle.id_exercise,
        wle.exercise_order,
        wle.notes,
        e.name as exercise_name,
        e.image_url as exercise_image,
        e.video_url as exercise_video,
        GROUP_CONCAT(
          CONCAT_WS('|', wls.set_number, wls.set_type, wls.weight_kg, wls.reps, wls.completed)
          ORDER BY wls.set_number
          SEPARATOR ','
        ) as sets_data
      FROM workout_log_exercises wle
      JOIN exercises e ON wle.id_exercise = e.id_exercise
      LEFT JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
      WHERE wle.id_log = ?
      GROUP BY wle.id_log_exercise, wle.id_exercise, wle.exercise_order, wle.notes, e.name, e.image_url, e.video_url
      ORDER BY wle.exercise_order ASC
    `,
      [id]
    );

    // Formatear los datos de sets
    const formattedExercises = exercises.map((ex) => {
      const sets = [];
      if (ex.sets_data) {
        const setsArray = ex.sets_data.split(",");
        setsArray.forEach((setStr) => {
          const [set_number, set_type, weight_kg, reps, completed] =
            setStr.split("|");
          sets.push({
            set_number: parseInt(set_number),
            type: set_type,
            kg: weight_kg ? parseFloat(weight_kg) : null,
            reps: reps ? parseInt(reps) : null,
            done: parseInt(completed) === 1,
          });
        });
      }

      return {
        id: ex.id_exercise,
        name: ex.exercise_name,
        thumbnail: ex.exercise_image,
        video_url: ex.exercise_video,
        sets: sets,
        notes: ex.notes,
      };
    });

    return res.status(200).json({
      success: true,
      exercises: formattedExercises,
    });
  } catch (error) {
    console.error("❌ Error al obtener ejercicios del log:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener ejercicios",
      error: error.message,
    });
  }
};

// Obtener usuarios que dieron like a un workout
const getWorkoutLikes = async (req, res) => {
  try {
    const { id } = req.params;

    const [likes] = await pool.promise().query(
      `
      SELECT 
        u.id_user,
        u.username,
        u.full_name,
        u.avatar_url
      FROM workout_likes wl
      JOIN users u ON wl.id_user = u.id_user
      WHERE wl.id_log = ?
      ORDER BY wl.created_at DESC
      LIMIT 50
    `,
      [id]
    );

    return res.status(200).json({
      success: true,
      likes,
    });
  } catch (error) {
    console.error("❌ Error al obtener likes:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener likes",
      error: error.message,
    });
  }
};

// Obtener workout logs de un usuario específico por userId
const getUserWorkoutLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const targetUserId = Number(userId);
    const currentUserId = req.user?.id_user ? Number(req.user.id_user) : null;

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: "userId es requerido",
      });
    }

    // Verificar si el usuario actual sigue al usuario del perfil
    let isFollowing = false;
    if (currentUserId && currentUserId !== targetUserId) {
      const [followCheck] = await pool
        .promise()
        .query(
          `SELECT 1 FROM follows WHERE follower_id = ? AND followed_id = ? LIMIT 1`,
          [currentUserId, targetUserId]
        );
      isFollowing = followCheck.length > 0;
    }

    // Si es el mismo usuario, mostrar todo (public, followers, private)
    // Si sigue al usuario, mostrar public y followers
    // Si no sigue, mostrar todo lo que no sea privado
    const isSameUser = currentUserId && currentUserId === targetUserId;
    let visibilityCondition;
    if (isSameUser) {
      visibilityCondition = "1 = 1";
    } else if (isFollowing) {
      visibilityCondition =
        "(wl.visibility IS NULL OR wl.visibility IN ('public', 'followers'))";
    } else {
      visibilityCondition =
        "(wl.visibility IS NULL OR wl.visibility <> 'private')";
    }

    const [logs] = await pool.promise().query(
      `
      SELECT 
        wl.id_log,
        wl.id_user,
        wl.id_routine,
        wl.log_date,
        wl.start_time,
        wl.end_time,
        wl.duration_minutes,
        wl.title,
        wl.description,
        wl.image_url,
        (SELECT COUNT(*) FROM workout_likes WHERE id_log = wl.id_log) AS likes_count,
        wl.rating,
        wl.visibility,
        wl.created_at,
        r.name AS routine_name,
        (SELECT COUNT(*) FROM workout_comments WHERE id_log = wl.id_log) AS comments_count,
        IF(wlikes.id_like IS NOT NULL, 1, 0) as user_liked,
        u.full_name,
        u.username,
        u.avatar_url,
        latest_comment.id_comment as latest_comment_id,
        latest_comment.content as latest_comment_content,
        latest_comment.created_at as latest_comment_created_at,
        comment_user.id_user as latest_comment_user_id,
        comment_user.username as latest_comment_username,
        comment_user.full_name as latest_comment_full_name,
        comment_user.avatar_url as latest_comment_avatar_url,
        COALESCE((SELECT SUM(wls.weight_kg)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_weight_kg,
        COALESCE((SELECT SUM(wls.reps)
          FROM workout_log_exercises wle
          JOIN workout_log_sets wls ON wle.id_log_exercise = wls.id_log_exercise
          WHERE wle.id_log = wl.id_log AND wls.completed = 1), 0) AS total_reps
      FROM workout_logs wl
      LEFT JOIN routines r ON wl.id_routine = r.id_routine
      LEFT JOIN workout_likes wlikes ON wl.id_log = wlikes.id_log AND wlikes.id_user = ?
      JOIN users u ON wl.id_user = u.id_user
      LEFT JOIN (
        SELECT wc.id_log, wc.id_comment, wc.content, wc.created_at, wc.id_user
        FROM workout_comments wc
        INNER JOIN (
          SELECT id_log, MAX(created_at) as max_created
          FROM workout_comments
          GROUP BY id_log
        ) latest ON wc.id_log = latest.id_log AND wc.created_at = latest.max_created
      ) latest_comment ON wl.id_log = latest_comment.id_log
      LEFT JOIN users comment_user ON latest_comment.id_user = comment_user.id_user
      WHERE wl.id_user = ? AND ${visibilityCondition}
      ORDER BY COALESCE(wl.end_time, wl.log_date, wl.created_at) DESC
    `,
      [currentUserId, targetUserId]
    );

    // Agrupar resultados por id_log
    const groupedLogs = logs.reduce((acc, log) => {
      const existingLog = acc.find((l) => l.id_log === log.id_log);
      if (!existingLog) {
        acc.push(log);
      }
      return acc;
    }, []);

    return res.status(200).json({
      success: true,
      logs: groupedLogs,
    });
  } catch (error) {
    console.error("❌ Error al obtener entrenamientos del usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener entrenamientos del usuario",
      error: error.message,
    });
  }
};

// Obtener entrenamientos solo de usuarios seguidos
module.exports = {
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
};
