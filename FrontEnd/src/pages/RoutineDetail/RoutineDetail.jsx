import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  Calendar,
  Target,
  TrendingUp,
  Play,
  Bookmark,
} from "lucide-react";
import {
  getRoutineById,
  saveRoutineForUser,
  unsaveRoutineForUser,
  getSavedRoutines,
} from "../../services/routinesService";
import { useAuth } from "../../context/AuthContext";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import "./RoutineDetail.css";

const RoutineDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startWorkout } = useActiveWorkout();
  const [routine, setRoutine] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadRoutineData = async () => {
      setLoading(true);

      const result = await getRoutineById(id);
      if (result.success && result.data) {
        setRoutine(result.data.routine);
        setExercises(result.data.exercises || []);
      }

      // Check if routine is saved
      const savedResult = await getSavedRoutines();
      if (savedResult.success && savedResult.data) {
        const savedIds = savedResult.data.map((r) => String(r.id_routine));
        setIsSaved(savedIds.includes(String(id)));
      }

      setLoading(false);
    };

    loadRoutineData();
  }, [id]);

  const getDifficultyLabel = (level) => {
    const labels = {
      easy: "Principiante",
      medium: "Intermedio",
      hard: "Avanzado",
    };
    return labels[level] || level;
  };

  const handleToggleSave = async () => {
    if (!user || !id || isSaving) return;

    setIsSaving(true);
    try {
      const result = isSaved
        ? await unsaveRoutineForUser(id)
        : await saveRoutineForUser(id);

      if (result.success) {
        setIsSaved(!isSaved);
      } else {
        alert(result.message || "Error al guardar la rutina");
      }
    } catch (error) {
      console.error("Error toggling save:", error);
      alert("Error al guardar la rutina");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartWorkout = () => {
    if (!routine || exercises.length === 0) {
      alert("No hay ejercicios en esta rutina");
      return;
    }

    console.log("🏋️ Iniciando rutina:", routine);
    console.log("📋 Ejercicios:", exercises);

    // Función para extraer el primer número de un rango como "8-10" o "15-20"
    const parseReps = (repsValue) => {
      if (!repsValue) return "";
      const strValue = String(repsValue);
      // Si es un rango (ej: "8-10"), tomar el primer número
      const match = strValue.match(/^(\d+)/);
      return match ? match[1] : strValue;
    };

    // Preparar los ejercicios en el formato que espera el contexto
    const workoutExercises = exercises.map((exercise) => {
      // Try to use detailed sets stored in notes
      let parsedSets = null;
      try {
        if (exercise.notes) {
          const parsed = JSON.parse(exercise.notes);
          if (parsed && parsed.sets && Array.isArray(parsed.sets)) {
            parsedSets = parsed.sets;
          }
        }
      } catch (e) {
        // ignore invalid JSON
      }

      const sets = parsedSets
        ? parsedSets.map((s) => ({
            type: s.type || "N",
            kg: s.kg || "",
            reps: parseReps(s.reps || s.reps_target || exercise.reps_target || exercise.reps),
            done: false,
            prev_kg: s.prev_kg || 0,
            prev_reps: s.prev_reps || 0,
          }))
        : Array.from({ length: Number(exercise.sets) || 1 }, () => ({
            type: "N",
            kg: "",
            reps: parseReps(exercise.reps_target || exercise.reps),
            done: false,
            prev_kg: 0,
            prev_reps: 0,
          }));

      const exerciseData = {
        id_exercise: exercise.id_exercise || exercise.id,
        name: exercise.name || exercise.exercise_name || "Ejercicio",
        image_url: exercise.thumbnail || exercise.image_url || null,
        notes: exercise.notes || "",
        usesCustomRest: !!exercise.rest_seconds,
        customRestSeconds: exercise.rest_seconds || null,
        sets,
      };
      console.log("🔧 Ejercicio preparado:", exerciseData);
      return exerciseData;
    });

    console.log("✅ Ejercicios finales para workout:", workoutExercises);

    // Iniciar el entrenamiento con la información de la rutina
    startWorkout({
      exercises: workoutExercises,
      routineInfo: {
        id_routine: routine.id_routine || id,
        name: routine.name,
      },
    });

    // Navegar a la página de entrenamiento
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/workout");
  };

  if (loading) {
    return (
      <div className="routine-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando rutina...</p>
        </div>
      </div>
    );
  }

  if (!routine) {
    return (
      <div className="routine-detail-page">
        <div className="error-container">
          <p>No se encontró la rutina</p>
          <button className="lifty-btn-primary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Verificar si la rutina es de Lucas
  const isLucasRoutine = routine.creator_username === "lucasguerrero";

  const coverImage = routine.image_url || routine.cover_image;
  const difficultyKey = routine.featured_difficulty || routine.difficulty_level;
  const difficultyLabel = difficultyKey
    ? getDifficultyLabel(difficultyKey)
    : null;
  const exercisesCount = Number(
    routine.total_exercises ?? exercises.length ?? 0
  );
  const totalSets = Number(
    routine.total_sets ??
      exercises.reduce((acc, ex) => acc + (ex.sets ? Number(ex.sets) : 0), 0)
  );
  const avgRestSeconds = routine.avg_rest_seconds
    ? Math.round(Number(routine.avg_rest_seconds))
    : null;
  const durationLabel =
    routine.display_duration ||
    routine.featured_duration ||
    routine.estimated_duration ||
    routine.duration ||
    null;
  const durationDisplay = durationLabel
    ? durationLabel.toString().toLowerCase().includes("min")
      ? durationLabel
      : `${durationLabel} min`
    : null;

  return (
    <div className="routine-detail-page">
      {/* Cover Image + Info */}
      <div className="rd-cover-section">
        {/* Back button positioned absolutely */}
        <button className="rd-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        {coverImage ? (
          <img src={coverImage} alt={routine.name} className="rd-cover-image" />
        ) : (
          <div className="rd-cover-placeholder">
            <Dumbbell size={64} strokeWidth={1.5} />
          </div>
        )}
        <div className="rd-cover-overlay">
          <div className="rd-cover-content">
            <h1 className="rd-title">{routine.name}</h1>
            <div className="rd-meta-row">
              {difficultyLabel && (
                <span className="rd-difficulty-badge">{difficultyLabel}</span>
              )}
              {durationDisplay && (
                <span className="rd-meta-pill">
                  <Clock size={14} strokeWidth={2} />
                  {durationDisplay}
                </span>
              )}
              <span className="rd-meta-pill">
                <Dumbbell size={14} strokeWidth={2} />
                {exercisesCount}{" "}
                {exercisesCount === 1 ? "Ejercicio" : "Ejercicios"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información del creador (solo si es de Lucas) */}
      {isLucasRoutine && (
        <div className="rd-creator-section">
          <div className="rd-creator-info">
            <img
              src={
                routine.creator_avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  routine.creator_name
                )}&background=7882b6&color=fff&size=256`
              }
              alt={routine.creator_name}
              className="rd-creator-avatar"
            />
            <div className="rd-creator-details">
              <span className="rd-creator-label">Creado por</span>
              <span className="rd-creator-name">{routine.creator_name}</span>
              <span className="rd-creator-username">
                @{routine.creator_username}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Descripción */}
      {routine.description && (
        <div className="rd-description-section">
          <h3 className="rd-section-title">Descripción</h3>
          <p className="rd-description">{routine.description}</p>
        </div>
      )}

      {/* Estadísticas rápidas */}
      <div className="rd-stats-section">
        <div className="rd-stat-item">
          <Dumbbell size={20} strokeWidth={2} />
          <div className="rd-stat-info">
            <span className="rd-stat-label">Ejercicios</span>
            <span className="rd-stat-value">{exercisesCount}</span>
          </div>
        </div>
        {totalSets > 0 && (
          <div className="rd-stat-item">
            <TrendingUp size={20} strokeWidth={2} />
            <div className="rd-stat-info">
              <span className="rd-stat-label">Series Totales</span>
              <span className="rd-stat-value">{totalSets}</span>
            </div>
          </div>
        )}
        {durationDisplay && (
          <div className="rd-stat-item">
            <Clock size={20} strokeWidth={2} />
            <div className="rd-stat-info">
              <span className="rd-stat-label">Duración Estimada</span>
              <span className="rd-stat-value">{durationDisplay}</span>
            </div>
          </div>
        )}
        {avgRestSeconds ? (
          <div className="rd-stat-item">
            <Calendar size={20} strokeWidth={2} />
            <div className="rd-stat-info">
              <span className="rd-stat-label">Descanso Prom.</span>
              <span className="rd-stat-value">{avgRestSeconds}s</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* Lista de ejercicios */}
      <div className="rd-exercises-section">
        <h3 className="rd-section-title">Ejercicios</h3>
        <div className="rd-exercises-list">
          {exercises.length === 0 ? (
            <p className="rd-no-exercises">No hay ejercicios en esta rutina</p>
          ) : (
            exercises.map((exercise, index) => {
              // Parse notes if they contain embedded JSON (created by backend)
              let parsedNotes = null;
              try {
                if (exercise.notes) {
                  parsedNotes = JSON.parse(exercise.notes);
                }
              } catch (e) {
                parsedNotes = null;
              }

              const displayNotes = parsedNotes
                ? parsedNotes.user_notes || ""
                : exercise.notes || "";

              return (
                <div
                  key={exercise.id_routine_exercise || index}
                  className="rd-exercise-card"
                >
                <div className="rd-card-header">
                  <img
                    src={
                      exercise.thumbnail ||
                      exercise.image_url ||
                      "https://via.placeholder.com/80"
                    }
                    alt={exercise.name}
                    className="rd-card-image"
                  />
                  <div className="rd-card-info">
                    <h4>{exercise.name}</h4>
                    {displayNotes && (
                      <p className="rd-exercise-notes">{displayNotes}</p>
                    )}
                  </div>
                </div>

                {/* Tabla de sets */}
                <div className="rd-sets-table">
                  <div className="rd-table-header">
                    <span className="rd-col-set">SERIE</span>
                    <span className="rd-col-prev">ANTERIOR</span>
                    <span className="rd-col-kg">KG</span>
                    <span className="rd-col-reps">REPS</span>
                    <span className="rd-col-check">✓</span>
                  </div>
                  <div className="rd-table-body">
                    {
                      // Try parsing detailed sets stored inside exercise.notes (JSON)
                      (() => {
                        // Use parsedNotes from above if available
                        let setsData = null;
                        if (parsedNotes && parsedNotes.sets && Array.isArray(parsedNotes.sets)) {
                          setsData = parsedNotes.sets;
                        }

                        if (setsData && setsData.length > 0) {
                          return setsData.map((s, i) => (
                            <div key={i} className="rd-set-row">
                              <div className="rd-col-set">
                                <span className={`rd-set-type rd-set-type-${s.type || 'N'}`}>
                                  {s.type || 'N'}
                                </span>
                                <span className="rd-set-number">{i + 1}</span>
                              </div>
                              <span className="rd-col-prev">{(s.prev_kg || 0)}kg × {(s.prev_reps || 0)}</span>
                              <span className="rd-col-kg">{s.kg || 0}</span>
                              <span className="rd-col-reps">{s.reps || exercise.reps_target || 5}</span>
                              <span className="rd-col-check">
                                <div className="rd-check-icon">✓</div>
                              </span>
                            </div>
                          ));
                        }

                        // Fallback: original behavior (number of sets)
                        return (exercise.sets ? (
                          Array.from({ length: exercise.sets }, (_, i) => (
                            <div key={i} className="rd-set-row">
                              <div className="rd-col-set">
                                <span className="rd-set-type rd-set-type-N">N</span>
                                <span className="rd-set-number">{i + 1}</span>
                              </div>
                              <span className="rd-col-prev">0kg × 0</span>
                              <span className="rd-col-kg">0</span>
                              <span className="rd-col-reps">{exercise.reps_target || 5}</span>
                              <span className="rd-col-check">
                                <div className="rd-check-icon">✓</div>
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="rd-set-row">
                            <div className="rd-col-set">
                              <span className="rd-set-type rd-set-type-N">N</span>
                              <span className="rd-set-number">1</span>
                            </div>
                            <span className="rd-col-prev">0kg × 0</span>
                            <span className="rd-col-kg">0</span>
                            <span className="rd-col-reps">{exercise.reps_target || 5}</span>
                            <span className="rd-col-check">
                              <div className="rd-check-icon">✓</div>
                            </span>
                          </div>
                        ));
                      })()
                    }
                  </div>
                </div>

                {/* Info de descanso */}
                {exercise.rest_seconds && (
                  <div className="rd-rest-info">
                    Descanso: {exercise.rest_seconds}s
                  </div>
                )}
              </div>
            );
            })
          )}
        </div>
      </div>

      {/* Botones de acción */}
      <div className="rd-action-section">
        <button
          className="lifty-btn-primary rd-start-button"
          onClick={handleStartWorkout}
        >
          <Dumbbell size={20} strokeWidth={2} />
          <span>Iniciar</span>
        </button>
        <button
          className={`lifty-btn-primary rd-save-button ${
            isSaved ? "saved" : ""
          }`}
          onClick={handleToggleSave}
          disabled={isSaving}
        >
          <Bookmark
            size={20}
            strokeWidth={2}
            fill={isSaved ? "currentColor" : "none"}
          />
          <span>{isSaving ? "..." : isSaved ? "Guardada" : "Guardar"}</span>
        </button>
      </div>
    </div>
  );
};

export default RoutineDetail;
