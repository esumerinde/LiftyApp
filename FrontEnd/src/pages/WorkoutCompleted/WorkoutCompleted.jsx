import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Dumbbell, Calendar, UserPlus } from "lucide-react";
import {
  getWorkoutLogById,
  getWorkoutLogExercises,
} from "../../services/workoutLogsService";
import {
  followUser,
  unfollowUser,
  checkFollowStatus,
} from "../../services/usersService";
import { useAuth } from "../../context/AuthContext";
import "./WorkoutCompleted.css";

const WorkoutCompleted = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadWorkoutData = async () => {
      setLoading(true);

      // Cargar datos del workout
      const workoutResult = await getWorkoutLogById(id);
      if (workoutResult.success && workoutResult.data?.log) {
        setWorkout(workoutResult.data.log);

        // Verificar si seguimos al usuario
        if (workoutResult.data.log.id_user !== user?.id_user) {
          const followStatus = await checkFollowStatus(
            workoutResult.data.log.id_user
          );
          if (followStatus.success) {
            setIsFollowing(followStatus.data?.isFollowing || false);
          }
        }
      }

      // Cargar ejercicios
      const exercisesResult = await getWorkoutLogExercises(id);
      if (exercisesResult.success && exercisesResult.data) {
        setExercises(exercisesResult.data.exercises || []);
      }

      setLoading(false);
    };

    loadWorkoutData();
  }, [id, user?.id_user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getSetTypeLabel = (type) => {
    if (type === "warmup") return "C";
    if (type === "dropset") return "D";
    return "N";
  };

  const handleFollowToggle = async () => {
    if (!workout || followLoading) return;

    setFollowLoading(true);
    try {
      if (isFollowing) {
        const result = await unfollowUser(workout.id_user);
        if (result.success) {
          setIsFollowing(false);
        }
      } else {
        const result = await followUser(workout.id_user);
        if (result.success) {
          setIsFollowing(true);
        }
      }
    } catch (error) {
      console.error("Error al cambiar follow:", error);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="workout-completed-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando entrenamiento...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="workout-completed-page">
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
    <div className="workout-completed-page">
      {/* Header con flecha atrás */}
      <div className="wc-header">
        <button className="wc-back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} strokeWidth={2.5} />
        </button>
        <div className="wc-header-info">
          {/* User info */}
          <div className="wc-user-info">
            <img
              src={workout.avatar_url || "https://via.placeholder.com/40"}
              alt={workout.username}
              className="wc-user-avatar"
            />
            <div className="wc-user-details">
              <span className="wc-user-name">{workout.full_name}</span>
              <span className="wc-user-username">@{workout.username}</span>
            </div>
            {workout.id_user !== user?.id_user && (
              <button
                className={`wc-follow-btn ${isFollowing ? "following" : ""}`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                <UserPlus size={18} strokeWidth={2} />
                <span>{isFollowing ? "Siguiendo" : "Seguir"}</span>
              </button>
            )}
          </div>

          <h1 className="wc-title">
            {workout.title || workout.routine_name || "Entrenamiento"}
          </h1>
          <div className="wc-header-stats">
            <div className="wc-stat">
              <Calendar size={16} strokeWidth={2} />
              <span>{formatDate(workout.log_date)}</span>
            </div>
            <div className="wc-stat">
              <Clock size={16} strokeWidth={2} />
              <span>{workout.duration_minutes || 0} min</span>
            </div>
            <div className="wc-stat">
              <Dumbbell size={16} strokeWidth={2} />
              <span>{exercises.length} ejercicios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de ejercicios */}
      <div className="wc-exercises-list">
        {exercises.length === 0 ? (
          <p className="wc-no-exercises">No hay ejercicios registrados</p>
        ) : (
          exercises.map((exercise, index) => (
            <div key={exercise.id || index} className="wc-exercise-card">
              <div className="wc-card-header">
                <img
                  src={
                    exercise.thumbnail ||
                    exercise.image_url ||
                    "https://via.placeholder.com/80"
                  }
                  alt={exercise.name}
                  className="wc-card-image"
                />
                <div className="wc-card-info">
                  <h4>{exercise.name}</h4>
                  {exercise.notes && (
                    <p className="wc-exercise-notes">{exercise.notes}</p>
                  )}
                </div>
              </div>

              {/* Tabla de sets */}
              <div className="wc-sets-table">
                <div className="wc-table-header">
                  <span className="wc-col-set">SERIE</span>
                  <span className="wc-col-prev">ANTERIOR</span>
                  <span className="wc-col-kg">KG</span>
                  <span className="wc-col-reps">REPS</span>
                  <span className="wc-col-check">✓</span>
                </div>
                <div className="wc-table-body">
                  {exercise.sets && exercise.sets.length > 0 ? (
                    exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className={`wc-set-row ${set.done ? "completed" : ""}`}
                      >
                        <div className="wc-col-set">
                          <span
                            className={`wc-set-type wc-set-type-${
                              set.type || "N"
                            }`}
                          >
                            {getSetTypeLabel(set.type)}
                          </span>
                          <span className="wc-set-number">
                            {set.set_number || setIndex + 1}
                          </span>
                        </div>
                        <div className="wc-col-prev">
                          <span className="wc-prev-value">
                            {set.prev_kg || 0}kg × {set.prev_reps || 0}
                          </span>
                        </div>
                        <div className="wc-col-kg">
                          <span className="wc-value">{set.kg || 0}</span>
                        </div>
                        <div className="wc-col-reps">
                          <span className="wc-value">{set.reps || 0}</span>
                        </div>
                        <div className="wc-col-check">
                          <div
                            className={`wc-check-icon ${
                              set.done ? "checked" : ""
                            }`}
                          >
                            {set.done ? "✓" : "○"}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="wc-no-sets">No hay series registradas</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutCompleted;
