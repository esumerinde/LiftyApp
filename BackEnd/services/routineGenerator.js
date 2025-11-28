const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require("../config/database");

// Inicializar Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GEMINI_MODEL = "gemini-2.5-flash";

/**
 * Mapear experience_level (beginner/intermediate/advanced)
 * a difficulty_level (easy/medium/hard) para la tabla routines
 */
function mapExperienceToDifficulty(experience) {
  switch (experience) {
    case "beginner":
      return "easy";
    case "intermediate":
      return "medium";
    case "advanced":
      return "hard";
    default:
      return "medium"; // fallback seguro
  }
}

/**
 * Genera y guarda una rutina personalizada con Gemini
 *
 * @param {number} userId
 * @param {Function} callback - callback(err, result)
 */
function generateAndSaveRoutine(userId, callback) {
  // 1) Obtener datos del usuario
  pool.query(
    `SELECT 
        u.id_user,
        u.full_name,
        up.main_goal,
        up.lifestyle,
        up.gender,
        up.experience_level
     FROM users u
     LEFT JOIN user_profiles up ON u.id_user = up.id_user
     WHERE u.id_user = ?`,
    [userId],
    (err, users) => {
      if (err) {
        console.error("❌ Error obteniendo usuario:", err);
        return callback(err);
      }

      if (!users || users.length === 0) {
        const error = new Error("Usuario no encontrado");
        console.error("❌", error.message, { userId });
        return callback(error);
      }

      const user = users[0];

      // 2) Obtener catálogo de ejercicios
      pool.query(
        `SELECT 
            id_exercise,
            name,
            difficulty
         FROM exercises
         ORDER BY id_exercise`,
        (err, exercises) => {
          if (err) {
            console.error("❌ Error obteniendo ejercicios:", err);
            return callback(err);
          }

          if (!exercises || exercises.length === 0) {
            const error = new Error(
              "No hay ejercicios disponibles en la base de datos"
            );
            console.error("❌", error.message);
            return callback(error);
          }

          const catalog = exercises.map((e) => ({
            id: e.id_exercise,
            name: e.name,
            difficulty: e.difficulty,
          }));

          const validExerciseIds = new Set(
            exercises.map((e) => Number(e.id_exercise))
          );

          // 3) Preparar prompt para Gemini
          const goalReadableMap = {
            lose_weight: "perder peso",
            gain_muscle: "ganar masa muscular",
            get_toned: "tonificar",
            maintain: "mantener composición y rendimiento",
          };

          const levelReadableMap = {
            beginner: "principiante",
            intermediate: "intermedio",
            advanced: "avanzado",
          };

          const goalReadable =
            goalReadableMap[user.main_goal] ||
            user.main_goal ||
            "no especificado";
          const levelReadable =
            levelReadableMap[user.experience_level] ||
            user.experience_level ||
            "no especificado";

          const prompt = `
Eres un entrenador personal experto.

Crea una rutina de gimnasio en formato JSON para el siguiente perfil:

- Nombre: ${user.full_name}
- Género: ${user.gender || "no especificado"}
- Objetivo principal: ${goalReadable}
- Nivel de experiencia: ${levelReadable}
- Estilo de vida: ${user.lifestyle || "no especificado"}

SOLO PUEDES USAR ejercicios del siguiente catálogo (id, nombre, dificultad):

${JSON.stringify(catalog, null, 2)}

REGLAS IMPORTANTES:
1. Usa únicamente IDs de ejercicio del catálogo.
2. Devuelve SOLO JSON válido, sin texto adicional ni markdown.
3. El JSON DEBE tener el siguiente formato EXACTO:

{
  "routineName": "Nombre corto de la rutina",
  "description": "Breve descripción de 1-2 frases",
  "exercises": [
    { 
      "id_exercise": 123, 
      "sets": 3, 
      "reps": "10-12", 
      "rest": 60, 
      "reason": "Breve justificación del ejercicio" 
    }
  ]
}

RESTRICCIONES:
- "reps" puede ser un número ("10") o un rango como string ("10-12").
- "rest" es el descanso en segundos (ej: 60, 90).
- Genera entre 4 y 8 ejercicios.
- Prioriza ejercicios con dificultad compatible con el nivel del usuario.
`;

          const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

          console.log("🔮 Llamando a Gemini para generar rutina", {
            model: GEMINI_MODEL,
            userId,
            userProfile: {
              name: user.full_name,
              goal: user.main_goal,
              level: user.experience_level,
              gender: user.gender,
            },
            exercisesCount: catalog.length,
          });

          // 4) Llamar a Gemini
          model
            .generateContent(prompt)
            .then((result) => {
              const response = result.response;
              let text = response.text() || "";

              // Limpiar posibles bloques de código Markdown
              text = text
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

              if (!text) {
                throw new Error("La IA devolvió una respuesta vacía");
              }

              let routineData;
              try {
                routineData = JSON.parse(text);
              } catch (parseErr) {
                console.error("❌ Error parseando JSON de Gemini:", parseErr);
                console.error("Texto recibido de la IA:", text);
                throw new Error("La IA devolvió un JSON inválido");
              }

              if (
                !routineData ||
                !Array.isArray(routineData.exercises) ||
                routineData.exercises.length === 0
              ) {
                throw new Error(
                  "La IA no devolvió ejercicios válidos en la rutina"
                );
              }

              // 5) Validar que los ejercicios existan en la DB
              let filteredExercises = routineData.exercises.filter((ex) =>
                validExerciseIds.has(Number(ex.id_exercise))
              );

              if (filteredExercises.length === 0) {
                throw new Error(
                  "Todos los ejercicios devueltos por la IA son inválidos"
                );
              }

              // Normalizar ejercicios (defaults)
              filteredExercises = filteredExercises.map((ex, index) => {
                let reps = ex.reps ?? "10";

                if (typeof reps !== "string") {
                  reps = String(reps);
                }

                return {
                  id_exercise: Number(ex.id_exercise),
                  sets: ex.sets || 3,
                  reps,
                  rest: ex.rest || 90,
                  order_index: index + 1,
                  reason: ex.reason || "",
                };
              });

              const routineName =
                routineData.routineName || "Mi Rutina Personalizada";
              const routineDescription =
                routineData.description || "Rutina generada automáticamente";

              const difficultyLevel = mapExperienceToDifficulty(
                user.experience_level
              );

              // 6) Guardar en DB dentro de una transacción
              pool.getConnection((err, conn) => {
                if (err) {
                  console.error("❌ Error obteniendo conexión:", err);
                  return callback(err);
                }

                conn.beginTransaction((err) => {
                  if (err) {
                    conn.release();
                    console.error(
                      "❌ Error iniciando transacción para rutina:",
                      err
                    );
                    return callback(err);
                  }

                  conn.query(
                    `INSERT INTO routines 
                      (assigned_to_user_id, name, description, goal, difficulty_level, created_at)
                     VALUES (?, ?, ?, ?, ?, NOW())`,
                    [
                      userId,
                      routineName,
                      routineDescription,
                      user.main_goal || "maintain",
                      difficultyLevel,
                    ],
                    (err, res) => {
                      if (err) {
                        console.error("❌ Error insertando rutina:", err);
                        return conn.rollback(() => {
                          conn.release();
                          callback(err);
                        });
                      }

                      const routineId = res.insertId;

                      const exercisesValues = filteredExercises.map((ex) => [
                        routineId,
                        ex.id_exercise,
                        ex.sets,
                        ex.reps,
                        ex.rest,
                        ex.order_index,
                        ex.reason,
                      ]);

                      conn.query(
                        `INSERT INTO routine_exercises 
                          (id_routine, id_exercise, sets, reps_target, rest_seconds, order_index, notes)
                         VALUES ?`,
                        [exercisesValues],
                        (err) => {
                          if (err) {
                            console.error(
                              "❌ Error insertando ejercicios de rutina:",
                              err
                            );
                            return conn.rollback(() => {
                              conn.release();
                              callback(err);
                            });
                          }

                          conn.commit((err) => {
                            if (err) {
                              console.error(
                                "❌ Error haciendo commit de la rutina:",
                                err
                              );
                              return conn.rollback(() => {
                                conn.release();
                                callback(err);
                              });
                            }

                            conn.release();
                            console.log(
                              "✅ Rutina generada y guardada exitosamente",
                              {
                                userId,
                                routineId,
                                exercisesCount: filteredExercises.length,
                              }
                            );

                            callback(null, {
                              success: true,
                              message:
                                "Rutina generada y guardada exitosamente",
                              data: {
                                routineId,
                                routineName,
                                description: routineDescription,
                                exercisesCount: filteredExercises.length,
                              },
                            });
                          });
                        }
                      );
                    }
                  );
                });
              });
            })
            .catch((err) => {
              console.error("❌ Error llamando a Gemini o guardando rutina:", {
                message: err.message,
                status: err.status,
                code: err.code,
                cause: err.cause,
                stack: err.stack?.split("\n").slice(0, 4).join("\n"),
              });
              callback(err);
            });
        }
      );
    }
  );
}

module.exports = {
  generateAndSaveRoutine,
};
