import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell, Award, Calendar } from "lucide-react";
import {
  getWorkoutLogById,
  getWorkoutLogExercises,
} from "../../services/workoutLogsService";
import "./WorkoutDetail.css";

const WorkoutDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkoutData = async () => {
      console.log("WorkoutDetail - Loading data for id:", id);
      setLoading(true);

      // Cargar datos del workout
      const workoutResult = await getWorkoutLogById(id);
      console.log("WorkoutDetail - Workout result:", workoutResult);
      if (workoutResult.success && workoutResult.data?.log) {
        setWorkout(workoutResult.data.log);
      } else {
        console.error("WorkoutDetail - No workout data", workoutResult);
      }

      // Cargar ejercicios
      const exercisesResult = await getWorkoutLogExercises(id);
      console.log("WorkoutDetail - Exercises result:", exercisesResult);
      if (exercisesResult.success && exercisesResult.data) {
        // Backend devuelve { success: true, exercises: [...] }
        setExercises(exercisesResult.data.exercises || []);
      } else {
        console.error("WorkoutDetail - No exercises data", exercisesResult);
      }

      setLoading(false);
    };

    loadWorkoutData();
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="workout-detail-page page-wrapper">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="workout-detail-page page-wrapper">
        <div className="error-container">
          <p>No se encontró el entrenamiento</p>
          <button className="lifty-btn-primary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="workout-detail-page page-wrapper">
      {/* Header con flecha atrás */}
      <div className="workout-detail-header">
        <button className="back-button-top" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <h1 className="workout-detail-title">Entrenamiento</h1>
      </div>

      {/* User Info Card */}
      <div className="workout-user-card">
        <img
          src={workout.avatar_url || "https://i.pravatar.cc/150?img=1"}
          alt={workout.username}
          className="workout-user-avatar"
        />
        <div className="workout-user-info">
          <h2 className="workout-user-name">
            {workout.full_name || workout.username}
          </h2>
          <p className="workout-user-username">@{workout.username}</p>
        </div>
      </div>

      {/* Workout Info */}
      <div className="workout-info-card">
        <h3 className="workout-title">
          {workout.title || workout.routine_name || "Entrenamiento"}
        </h3>
        {workout.description && (
          <p className="workout-description">{workout.description}</p>
        )}

        <div className="workout-stats">
          <div className="workout-stat-item">
            <Calendar size={20} strokeWidth={2} />
            <div className="workout-stat-info">
              <span className="workout-stat-label">Fecha</span>
              <span className="workout-stat-value">
                {formatDate(workout.log_date)}
              </span>
            </div>
          </div>
          <div className="workout-stat-item">
            <Clock size={20} strokeWidth={2} />
            <div className="workout-stat-info">
              <span className="workout-stat-label">Duración</span>
              <span className="workout-stat-value">
                {workout.duration_minutes || 0} min
              </span>
            </div>
          </div>
          <div className="workout-stat-item">
            <Dumbbell size={20} strokeWidth={2} />
            <div className="workout-stat-info">
              <span className="workout-stat-label">Ejercicios</span>
              <span className="workout-stat-value">{exercises.length}</span>
            </div>
          </div>
          {workout.rating && (
            <div className="workout-stat-item">
              <Award size={20} strokeWidth={2} />
              <div className="workout-stat-info">
                <span className="workout-stat-label">Valoración</span>
                <span className="workout-stat-value">{workout.rating}/5</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Exercises List */}
      <div className="workout-exercises-section">
        <h3 className="section-title">Ejercicios Realizados</h3>

        {exercises.length === 0 ? (
          <p className="no-exercises">No hay ejercicios registrados</p>
        ) : (
          exercises.map((exercise, index) => (
            <div
              key={exercise.id_log_exercise || index}
              className="exercise-detail-card"
            >
              <div className="exercise-header">
                <div className="exercise-number">{index + 1}</div>
                <div className="exercise-info">
                  <h4 className="exercise-name">{exercise.name}</h4>
                  {exercise.notes && (
                    <p className="exercise-notes">{exercise.notes}</p>
                  )}
                </div>
              </div>

              {exercise.sets && exercise.sets.length > 0 && (
                <div className="exercise-sets-table">
                  <div className="sets-table-header">
                    <span className="set-col">Serie</span>
                    <span className="weight-col">Peso (kg)</span>
                    <span className="reps-col">Reps</span>
                    <span className="status-col">Estado</span>
                  </div>
                  <div className="sets-table-body">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`set-row ${
                          set.done || set.completed ? "completed" : "incomplete"
                        }`}
                      >
                        <span className="set-col">
                          {set.set_type === "warmup" && "🔥 "}
                          {set.set_type === "dropset" && "⚡ "}
                          Serie {set.set_number || setIndex + 1}
                        </span>
                        <span className="weight-col">
                          {set.kg || set.weight_kg || 0} kg
                        </span>
                        <span className="reps-col">{set.reps || 0}</span>
                        <span className="status-col">
                          {set.done || set.completed
                            ? "✓ Completada"
                            : "○ Pendiente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutDetail;
