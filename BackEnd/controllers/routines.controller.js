// controllers/routines.controller.js
const { pool } = require("../config/database");
const { generateAndSaveRoutine } = require("../services/routineGenerator");

const normalizeRoutineRow = (row) => {
  if (!row) {
    return row;
  }

  const normalized = { ...row };

  if (normalized.exercises_count === undefined && normalized.total_exercises) {
    normalized.exercises_count = Number(normalized.total_exercises) || 0;
  }

  return normalized;
};

// Obtener todas las rutinas
const getAllRoutines = async (req, res) => {
  try {
    const [rows] = await pool.promise().query(`
        SELECT r.*, u.full_name as creator_name
        FROM routines r
        LEFT JOIN users u ON r.creator_id = u.id_user
        ORDER BY r.created_at DESC
      `);

    return res.json(rows);
  } catch (err) {
    console.error("Error en getAllRoutines:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener rutina por ID con ejercicios
const getRoutineById = async (req, res) => {
  try {
    const { id } = req.params;

    const [routine] = await pool.promise().query(
      `
        SELECT r.*,
               u.full_name as creator_name,
               u.username as creator_username,
               u.avatar_url as creator_avatar,
               stats.total_exercises,
               stats.total_sets,
               stats.avg_rest_seconds
        FROM routines r
        LEFT JOIN users u ON r.creator_id = u.id_user
        LEFT JOIN (
          SELECT id_routine,
                 COUNT(*) AS total_exercises,
                 SUM(COALESCE(sets, 0)) AS total_sets,
                 AVG(NULLIF(rest_seconds, 0)) AS avg_rest_seconds
          FROM routine_exercises
          GROUP BY id_routine
        ) stats ON stats.id_routine = r.id_routine
        WHERE r.id_routine = ?
      `,
      [id]
    );

    if (routine.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rutina no encontrada",
      });
    }

    // Obtener ejercicios de la rutina
    const [exercises] = await pool.promise().query(
      `
        SELECT re.*, 
               e.name, 
               e.id_muscle_group, 
               e.video_url,
               e.image_url,
               e.equipment,
               e.difficulty,
               mg.name as muscle_group
        FROM routine_exercises re
        JOIN exercises e ON re.id_exercise = e.id_exercise
        LEFT JOIN muscle_groups mg ON e.id_muscle_group = mg.id_muscle_group
        WHERE re.id_routine = ?
        ORDER BY re.order_index
      `,
      [id]
    );

    const routineData = routine[0];

    // Complementar con información destacada (imagen de portada, duración, etc.)
    const [featuredRows] = await pool.promise().query(
      `
        SELECT image_url, duration, difficulty, is_premium
        FROM featured_routines
        WHERE id_routine = ? AND is_active = TRUE
        ORDER BY display_order ASC
        LIMIT 1
      `,
      [id]
    );

    const featuredData = featuredRows?.[0];

    if (featuredData) {
      routineData.cover_image = featuredData.image_url;
      routineData.featured_duration = featuredData.duration;
      routineData.featured_difficulty = featuredData.difficulty;
      routineData.is_premium_routine = featuredData.is_premium;

      if (!routineData.image_url) {
        routineData.image_url = featuredData.image_url;
      }
    }

    const exercisesCount = exercises.length;
    const totalSetsFromExercises = exercises.reduce(
      (acc, ex) => acc + (ex.sets ? Number(ex.sets) : 0),
      0
    );
    const totalRestSeconds = exercises.reduce(
      (acc, ex) => acc + (ex.rest_seconds ? Number(ex.rest_seconds) : 0),
      0
    );

    routineData.total_exercises = Number(routineData.total_exercises || 0)
      ? Number(routineData.total_exercises)
      : exercisesCount;

    routineData.total_sets = Number(routineData.total_sets || 0)
      ? Number(routineData.total_sets)
      : totalSetsFromExercises;

    const avgRestFromStats = routineData.avg_rest_seconds
      ? Number(routineData.avg_rest_seconds)
      : null;

    if (!avgRestFromStats && exercisesCount > 0) {
      routineData.avg_rest_seconds = Number(
        (totalRestSeconds / exercisesCount).toFixed(2)
      );
    } else if (avgRestFromStats) {
      routineData.avg_rest_seconds = Number(
        avgRestFromStats.toFixed
          ? avgRestFromStats.toFixed(2)
          : avgRestFromStats
      );
    }

    const durationLabel =
      routineData.featured_duration ||
      routineData.estimated_duration ||
      routineData.duration_label;

    if (!durationLabel && exercisesCount > 0) {
      const fallbackMinutes = Math.max(20, Math.round(exercisesCount * 5));
      routineData.display_duration = `${fallbackMinutes} min`;
    } else if (durationLabel) {
      routineData.display_duration = durationLabel;
    }

    return res.json({
      success: true,
      data: {
        routine: routineData,
        exercises: exercises,
      },
    });
  } catch (err) {
    console.error("Error en getRoutineById:", err);
    return res.status(500).json({
      success: false,
      message: "Error interno",
    });
  }
};

// Crear rutina
const createRoutine = async (req, res) => {
  try {
    const {
      name,
      description,
      goal,
      difficulty_level,
      is_public,
      assigned_to_user_id,
      exercises,
    } = req.body;
    const creator_id = req.user.id_user;

    if (!name) {
      return res.status(400).json({ message: "El nombre es requerido" });
    }

    const [result] = await pool.promise().query(
      `INSERT INTO routines (creator_id, assigned_to_user_id, name, description, goal, difficulty_level, is_public)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        creator_id,
        assigned_to_user_id || null,
        name,
        description || null,
        goal || null,
        difficulty_level || "medium",
        is_public !== undefined ? is_public : false, // Por defecto privado
      ]
    );

    const routineId = result.insertId;

    // Marcar la rutina como guardada para su creador (user_favorites)
    try {
      await pool.promise().query(
        `INSERT INTO user_favorites (id_user, item_id, type, created_at)
           VALUES (?, ?, 'routine', NOW())`,
        [creator_id, routineId]
      );
    } catch (favErr) {
      // No interrumpir la creación si falla el marcado como favorito
      console.error('Error al marcar rutina como guardada:', favErr);
    }

    // Agregar ejercicios si se proporcionaron
    if (exercises && Array.isArray(exercises)) {
      for (let i = 0; i < exercises.length; i++) {
        const ex = exercises[i];
        // Contar sets desde el array de sets
        const setsCount = ex.sets && Array.isArray(ex.sets) ? ex.sets.length : (ex.sets || 3);
        
        // Guardar detalle de sets (tipo, kg, reps) en el campo `notes` como JSON
        // para preservar la información de tipos de set aunque la tabla original
        // no tenga una columna específica para sets detallados.
        const notesPayload = {
          user_notes: ex.notes || null,
          sets: Array.isArray(ex.sets) ? ex.sets : null,
        };

        await pool.promise().query(
          `INSERT INTO routine_exercises (id_routine, id_exercise, sets, reps_target, rest_seconds, notes, order_index)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            routineId,
            ex.id_exercise,
            setsCount,
            ex.reps_target || "10",
            ex.rest_timer || ex.rest_seconds || 90,
            JSON.stringify(notesPayload),
            i,
          ]
        );
      }
    }

    // Si el usuario es entrenador, crear notificaciones para todos los usuarios
    try {
      const [[creator]] = await pool.promise().query(
        'SELECT role, full_name, username FROM users WHERE id_user = ?',
        [creator_id]
      );

      if (creator && creator.role === 'trainer') {
          // Obtener todos los usuarios (incluye admins y nutricionistas)
          const [users] = await pool.promise().query(
            'SELECT id_user, role FROM users'
          );

          const trainerName = creator.full_name || creator.username || 'Un entrenador';

          // Construir lista de destinatarios:
          // - Incluir a todos los usuarios normalmente
          // - Excluir al creador salvo que el creador sea admin o nutritionist
          const recipients = users.filter((u) => {
            if (u.id_user === creator_id) {
              // Si el creador tiene rol 'admin' o 'nutritionist', incluirlo
              return creator.role === 'admin' || creator.role === 'nutritionist';
            }
            return true;
          });

          // Crear notificación para cada destinatario
          const notificationPromises = recipients.map((user) =>
            pool.promise().query(
              `INSERT INTO notifications (id_user, type, title, message, related_id)
               VALUES (?, 'new_routine', ?, ?, ?)`,
              [
                user.id_user,
                'Nueva Rutina Disponible',
                `${trainerName} ha creado una nueva rutina: "${name}"`,
                routineId,
              ]
            )
          );

          await Promise.all(notificationPromises);
          console.log(`✅ Notificaciones creadas para ${recipients.length} usuarios`);
      }
    } catch (notifErr) {
      // No interrumpir la creación si fallan las notificaciones
      console.error('Error al crear notificaciones:', notifErr);
    }

    return res.status(201).json({
      success: true,
      message: "Rutina creada exitosamente",
      id_routine: routineId,
    });
  } catch (err) {
    console.error("Error en createRoutine:", err);
    return res.status(500).json({ 
      success: false,
      message: "Error interno al crear la rutina" 
    });
  }
};

// Actualizar rutina
const updateRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      goal,
      difficulty_level,
      is_public,
      assigned_to_user_id,
    } = req.body;

    const [result] = await pool.promise().query(
      `UPDATE routines 
         SET name = ?, description = ?, goal = ?, difficulty_level = ?, is_public = ?, assigned_to_user_id = ?
         WHERE id_routine = ?`,
      [
        name,
        description,
        goal,
        difficulty_level,
        is_public,
        assigned_to_user_id,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    return res.json({ message: "Rutina actualizada exitosamente" });
  } catch (err) {
    console.error("Error en updateRoutine:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Eliminar rutina
const deleteRoutine = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool
      .promise()
      .query("DELETE FROM routines WHERE id_routine = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Rutina no encontrada" });
    }

    return res.json({ message: "Rutina eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteRoutine:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Obtener rutinas del usuario autenticado
const getMyRoutines = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const [rows] = await pool.promise().query(
      `
        SELECT 
          r.*, 
          u.full_name AS creator_name,
          u.username AS creator_username,
          COUNT(DISTINCT re.id_routine_exercise) AS exercises_count
        FROM routines r
        LEFT JOIN users u ON r.creator_id = u.id_user
        LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
        WHERE r.assigned_to_user_id = ? OR r.creator_id = ?
        GROUP BY r.id_routine
        ORDER BY r.created_at DESC
      `,
      [userId, userId]
    );

    const normalized = rows.map(normalizeRoutineRow);

    return res.json({ success: true, data: normalized });
  } catch (err) {
    console.error("Error en getMyRoutines:", err);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
};

const getSavedRoutines = async (req, res) => {
  try {
    const userId = req.user.id_user;

    const [rows] = await pool.promise().query(
      `
        SELECT 
          r.*, 
          u.full_name AS creator_name,
          COUNT(DISTINCT re.id_routine_exercise) AS exercises_count,
          MAX(uf.created_at) AS saved_at
        FROM user_favorites uf
        JOIN routines r ON uf.item_id = r.id_routine
        LEFT JOIN users u ON r.creator_id = u.id_user
        LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
        WHERE uf.id_user = ? AND uf.type = 'routine'
        GROUP BY r.id_routine
        ORDER BY saved_at DESC
      `,
      [userId]
    );

    const normalized = rows.map(normalizeRoutineRow);

    return res.json({ success: true, data: normalized });
  } catch (err) {
    console.error("Error en getSavedRoutines:", err);
    return res.status(500).json({
      success: false,
      message: "Error al obtener rutinas guardadas",
    });
  }
};

const saveRoutine = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const routineId = Number(req.params.id);

    if (!routineId) {
      return res.status(400).json({
        success: false,
        message: "ID de rutina inválido",
      });
    }

    const [routineRows] = await pool
      .promise()
      .query(`SELECT id_routine FROM routines WHERE id_routine = ?`, [
        routineId,
      ]);

    if (routineRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Rutina no encontrada",
      });
    }

    await pool.promise().query(
      `
        INSERT INTO user_favorites (id_user, item_id, type)
        VALUES (?, ?, 'routine')
        ON DUPLICATE KEY UPDATE created_at = created_at
      `,
      [userId, routineId]
    );

    return res.json({ success: true, message: "Rutina guardada" });
  } catch (err) {
    console.error("Error en saveRoutine:", err);
    return res.status(500).json({
      success: false,
      message: "Error al guardar la rutina",
    });
  }
};

const removeSavedRoutine = async (req, res) => {
  try {
    const userId = req.user.id_user;
    const routineId = Number(req.params.id);

    if (!routineId) {
      return res.status(400).json({
        success: false,
        message: "ID de rutina inválido",
      });
    }

    const [result] = await pool.promise().query(
      `
        DELETE FROM user_favorites
        WHERE id_user = ? AND item_id = ? AND type = 'routine'
      `,
      [userId, routineId]
    );

    return res.json({
      success: true,
      removed: result.affectedRows > 0,
    });
  } catch (err) {
    console.error("Error en removeSavedRoutine:", err);
    return res.status(500).json({
      success: false,
      message: "Error al eliminar la rutina guardada",
    });
  }
};

// Obtener rutinas destacadas por secciones
const getFeaturedRoutines = async (req, res) => {
  try {
    const [trending] = await pool.promise().query(`
      SELECT fr.*, 
             r.name, 
             r.description,
             r.creator_id,
             u.username as creator_username,
             u.full_name as creator_name,
             COUNT(DISTINCT re.id_routine_exercise) AS exercises_count
      FROM featured_routines fr
      LEFT JOIN routines r ON fr.id_routine = r.id_routine
      LEFT JOIN users u ON r.creator_id = u.id_user
      LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
      WHERE fr.section_type = 'trending' AND fr.is_active = TRUE
      GROUP BY fr.id_featured_routine
      ORDER BY fr.display_order
    `);

    const [popular] = await pool.promise().query(`
      SELECT fr.*, 
             r.name, 
             r.description,
             r.creator_id,
             u.username as creator_username,
             u.full_name as creator_name,
             COUNT(DISTINCT re.id_routine_exercise) AS exercises_count
      FROM featured_routines fr
      LEFT JOIN routines r ON fr.id_routine = r.id_routine
      LEFT JOIN users u ON r.creator_id = u.id_user
      LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
      WHERE fr.section_type = 'popular' AND fr.is_active = TRUE
      GROUP BY fr.id_featured_routine
      ORDER BY fr.display_order
    `);

    const [trainers] = await pool.promise().query(`
      SELECT fr.*, 
             r.name, 
             r.description,
             r.creator_id,
             u.username as creator_username,
             u.full_name as creator_name,
             COUNT(DISTINCT re.id_routine_exercise) AS exercises_count
      FROM featured_routines fr
      LEFT JOIN routines r ON fr.id_routine = r.id_routine
      LEFT JOIN users u ON r.creator_id = u.id_user
      LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
      WHERE fr.section_type = 'trainers' AND fr.is_active = TRUE
      GROUP BY fr.id_featured_routine
      ORDER BY fr.display_order
    `);

    const [recommended] = await pool.promise().query(`
      SELECT fr.*, 
             r.name, 
             r.description,
             r.creator_id,
             u.username as creator_username,
             u.full_name as creator_name,
             COUNT(DISTINCT re.id_routine_exercise) AS exercises_count
      FROM featured_routines fr
      LEFT JOIN routines r ON fr.id_routine = r.id_routine
      LEFT JOIN users u ON r.creator_id = u.id_user
      LEFT JOIN routine_exercises re ON re.id_routine = r.id_routine
      WHERE fr.section_type = 'recommended' AND fr.is_active = TRUE
      GROUP BY fr.id_featured_routine
      ORDER BY fr.display_order
    `);

    return res.json({
      success: true,
      data: {
        trending: trending.map(normalizeRoutineRow),
        popular: popular.map(normalizeRoutineRow),
        trainers: trainers.map(normalizeRoutineRow),
        recommended: recommended.map(normalizeRoutineRow),
      },
    });
  } catch (err) {
    console.error("Error en getFeaturedRoutines:", err);
    return res.status(500).json({ message: "Error interno" });
  }
};

// Generar rutina personalizada con IA
const generateRoutine = async (req, res) => {
  try {
    const userId = req.user.id_user;

    generateAndSaveRoutine(userId, async (err, result) => {
      if (err || !result.success) {
        console.error("Error generando rutina:", err || result);
        return res.status(500).json({
          success: false,
          message: result?.message || err?.message || "Error al generar rutina",
        });
      }

      // Actualizar imagen de portada de la rutina
      const coverImageUrl = "https://i.imgur.com/nCP1kny.png";
      await pool
        .promise()
        .query(`UPDATE routines SET image_url = ? WHERE id_routine = ?`, [
          coverImageUrl,
          result.data.routineId,
        ]);

      return res.status(201).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    });
  } catch (err) {
    console.error("Error en generateRoutine controller:", err);
    return res.status(500).json({
      success: false,
      message: "Error al generar rutina con IA",
      error: err.message,
    });
  }
};

module.exports = {
  getAllRoutines,
  getRoutineById,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  getMyRoutines,
  getSavedRoutines,
  saveRoutine,
  removeSavedRoutine,
  getFeaturedRoutines,
  generateRoutine,
};
