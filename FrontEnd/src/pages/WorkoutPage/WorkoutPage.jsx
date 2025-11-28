import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Clock,
  Search,
  MoreVertical,
  Timer,
  Trash2,
  Check,
  Edit2,
  RotateCcw,
} from "lucide-react";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import WorkoutPageAllExercises from "./WorkoutPageAllExercises";
import WorkoutPageExerciseCard from "./WorkoutPageExerciseCard";
import RestTimeModal from "./RestTimeModal";
import ConfirmFinishModal from "./ConfirmFinishModal";
import ResetWorkoutModal from "./ResetWorkoutModal";
import "./WorkoutPage.css";
import "./WorkoutPageExerciseCard.css";

// ==========================================================
// COMPONENTE PRINCIPAL - WORKOUT PAGE
// ==========================================================
const WorkoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    isActive,
    workout,
    addExercises,
    updateExerciseField,
    addSet,
    removeSet,
    resetWorkout,
    startWorkout,
  } = useActiveWorkout();

  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  // Si no hay entrenamiento activo, iniciar uno vacío o con datos de location.state
  useEffect(() => {
    if (!isActive) {
      const initialWorkout = location.state?.workout || [];
      if (initialWorkout.length > 0) {
        startWorkout({ exercises: initialWorkout });
      } else {
        startWorkout({ exercises: [] });
      }
    }
  }, [isActive, location.state, startWorkout]);

  const handleAddExercises = () => {
    setShowAddExerciseModal(true);
  };

  const handleExercisesSelected = (selectedExercises) => {
    const newExercises = selectedExercises.map((ex) => ({
      id_exercise: ex.id_exercise,
      name: ex.name_exercise || ex.name,
      image_url: ex.image_url || ex.thumbnail,
      notes: "",
      usesCustomRest: false,
      customRestSeconds: null,
      sets: [
        {
          type: "N",
          kg: "",
          reps: "",
          done: false,
          prev_kg: 0,
          prev_reps: 0,
        },
      ],
    }));
    addExercises(newExercises);
    setShowAddExerciseModal(false);
  };

  const handleFinish = (duration, totalVolume, totalSets) => {
    // Prepare workout data for ending page - NO resetear aquí
    const exercisesData = workout.map((ex) => ({
      id_exercise: ex.id_exercise,
      name: ex.name || `Exercise ${ex.id}`,
      completedSets: ex.sets.filter((s) => s.done).length,
      totalSets: ex.sets.length,
      sets: ex.sets, // Incluir los sets completos
    }));

    const workoutData = {
      duration,
      totalVolume,
      totalSets,
      exercises: exercisesData,
      fullWorkout: workout, // Pasar el workout completo para poder restaurar
      durationSeconds: duration, // Pasar duración para restaurar
    };

    // NO llamar resetWorkout() aquí - solo navegar
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/workout/ending", { state: { workoutData } });
  };

  const handleSetUpdate = (exerciseId, setId, field, value) => {
    updateExerciseField(exerciseId, setId, field, value);
  };

  const handleAddSet = (exerciseId) => {
    addSet(exerciseId);
  };

  const handleRemoveSet = (exerciseId, setId) => {
    removeSet(exerciseId, setId);
  };

  return (
    <div className="workout-page">
      {showAddExerciseModal && (
        <WorkoutPageAllExercises
          onClose={() => setShowAddExerciseModal(false)}
          onSelect={handleExercisesSelected}
        />
      )}
      {!showAddExerciseModal && (
        <ActiveWorkout
          workout={workout}
          onAddExercises={handleAddExercises}
          onFinish={handleFinish}
          onSetUpdate={handleSetUpdate}
          onAddSet={handleAddSet}
          onRemoveSet={handleRemoveSet}
        />
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE: Entrenamiento Activo
// ==========================================================
const ActiveWorkout = ({
  workout,
  onAddExercises,
  onFinish,
  onSetUpdate,
  onAddSet,
  onRemoveSet,
}) => {
  const { globalRestSeconds, setGlobalRestSeconds, durationSeconds, resetDuration } =
    useActiveWorkout();
  const [showGlobalRestModal, setShowGlobalRestModal] = useState(false);
  const [showConfirmFinishModal, setShowConfirmFinishModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [incompleteExercises, setIncompleteExercises] = useState([]);

  // Animación de métricas
  useEffect(() => {
    const metricsCard = document.querySelector(".wp-metrics-card");
    if (metricsCard) {
      setTimeout(() => metricsCard.classList.add("metric-visible"), 100);
    }
  }, []);

  const handleGlobalRestConfig = (seconds) => {
    setGlobalRestSeconds(seconds);
    setShowGlobalRestModal(false);
  };

  const openGlobalRestModal = () => {
    setShowGlobalRestModal(true);
  };

  const checkIncompleteSets = () => {
    const incomplete = workout.filter((exercise) => {
      const hasIncompleteSets = exercise.sets.some((set) => !set.done);
      return hasIncompleteSets;
    });
    return incomplete;
  };

  const handleFinishClick = () => {
    const incomplete = checkIncompleteSets();
    if (incomplete.length > 0) {
      setIncompleteExercises(incomplete);
      setShowConfirmFinishModal(true);
    } else {
      onFinish(durationSeconds, totalVolume, totalSets);
    }
  };

  const handleConfirmFinish = () => {
    setShowConfirmFinishModal(false);
    onFinish(durationSeconds, totalVolume, totalSets);
  };

  const handleResumeWorkout = () => {
    setShowConfirmFinishModal(false);
  };

  const handleResetTimer = () => {
    resetDuration();
    setShowResetModal(false);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Calcular métricas en tiempo real
  const totalSets = workout.reduce((acc, ex) => acc + ex.sets.length, 0);
  const totalVolume = workout.reduce((acc, ex) => {
    return (
      acc +
      ex.sets.reduce((setAcc, set) => {
        if (
          set.done &&
          set.type !== "W" &&
          !isNaN(parseFloat(set.kg)) &&
          !isNaN(parseInt(set.reps))
        ) {
          return setAcc + parseFloat(set.kg) * parseInt(set.reps);
        }
        return setAcc;
      }, 0)
    );
  }, 0);

  return (
    <div className="wp-active-workout-view">
      {showGlobalRestModal && (
        <RestTimeModal
          onClose={() => setShowGlobalRestModal(false)}
          onSelectTime={handleGlobalRestConfig}
          currentTime={globalRestSeconds}
        />
      )}
      {showConfirmFinishModal && (
        <ConfirmFinishModal
          incompleteExercises={incompleteExercises}
          onFinishAnyway={handleConfirmFinish}
          onResume={handleResumeWorkout}
        />
      )}
      {showResetModal && (
        <ResetWorkoutModal
          onClose={() => setShowResetModal(false)}
          onConfirm={handleResetTimer}
        />
      )}
      <div className="wp-active-workout-header">
        <button
          className="lifty-btn-secondary-dark"
          onClick={openGlobalRestModal}
        >
          <Timer size={20} />
          <span>Descanso</span>
        </button>
        <button
          className="lifty-btn-secondary-dark"
          onClick={() => setShowResetModal(true)}
        >
          <RotateCcw size={20} />
          <span>Reiniciar</span>
        </button>
        <button
          className="lifty-btn-secondary-dark"
          onClick={handleFinishClick}
        >
          Finalizar
        </button>
      </div>
      <div className="wp-metrics-bar">
        <div className="wp-metrics-card">
          <div className="wp-metrics-grid">
            <div className="wp-metric-item">
              <span>Duración</span>
              <strong>{formatTime(durationSeconds)}</strong>
            </div>
            <div className="wp-metric-item">
              <span>Volumen</span>
              <strong>{totalVolume} kg</strong>
            </div>
            <div className="wp-metric-item">
              <span>Sets</span>
              <strong>{totalSets}</strong>
            </div>
          </div>
        </div>
      </div>
      <div className="wp-exercise-list">
        {workout.length === 0 ? (
          <div className="wp-no-exercises-placeholder">
            <p>Añade tu primer ejercicio</p>
          </div>
        ) : (
          workout.map((ex) => (
            <WorkoutPageExerciseCard
              key={ex.id}
              exercise={ex}
              onSetUpdate={onSetUpdate}
              onAddSet={onAddSet}
              onRemoveSet={onRemoveSet}
            />
          ))
        )}
      </div>
      <div className="wp-active-workout-footer">
        <button
          className="lifty-btn-secondary-dark wp-footer-add-btn"
          onClick={onAddExercises}
        >
          <Plus size={20} strokeWidth={2} />
          Añadir Ejercicios
        </button>
      </div>
    </div>
  );
};

// ==========================================================
// COMPONENTE: Card de Ejercicio
// ==========================================================
// ==========================================================
// WorkoutExerciseCard component moved to:
// ./WorkoutPageExerciseCard.jsx
// ==========================================================

export default WorkoutPage;
