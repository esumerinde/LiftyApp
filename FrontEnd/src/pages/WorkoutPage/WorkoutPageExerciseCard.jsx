import { useState, useEffect } from "react";
import { Timer, MoreVertical, Edit2, Check, Plus } from "lucide-react";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import RestTimeModal from "./RestTimeModal";
import "./WorkoutPageExerciseCard.css";

const WorkoutPageExerciseCard = ({
  exercise,
  onSetUpdate,
  onAddSet,
  onRemoveSet,
}) => {
  const { 
    globalRestSeconds, 
    getRestRemaining, 
    startRestTimer, 
    stopRestTimer,
    setExerciseRest 
  } = useActiveWorkout();
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [showRestTimeModal, setShowRestTimeModal] = useState(false);
  const [editingSetId, setEditingSetId] = useState(null);
  const [restTimeRemaining, setRestTimeRemaining] = useState(0);

  // Obtener tiempo de descanso para este ejercicio
  const exerciseRestTime = exercise.usesCustomRest 
    ? exercise.customRestSeconds 
    : globalRestSeconds;

  // Actualizar el tiempo restante cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRestRemaining(exercise.id);
      setRestTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [exercise.id, getRestRemaining]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const toggleSetDone = (setId) => {
    const set = exercise.sets.find((s) => s.id === setId);
    const newDoneState = !set.done;
    onSetUpdate(exercise.id, setId, "done", newDoneState);

    // Si se completa el set, iniciar timer de descanso automáticamente
    if (newDoneState && exerciseRestTime > 0) {
      startRestTimer(exercise.id);
      
      // Enfocar el input de kg de la siguiente serie
      const currentIndex = exercise.sets.findIndex((s) => s.id === setId);
      const nextSet = exercise.sets[currentIndex + 1];
      if (nextSet) {
        setTimeout(() => {
          const nextInput = document.querySelector(
            `input[data-set-id="${nextSet.id}"][data-field="kg"]`
          );
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
          }
        }, 100);
      }
    }
  };

  const handleRestTimerClick = () => {
    if (restTimeRemaining > 0) {
      // Si hay un timer activo, detenerlo
      stopRestTimer(exercise.id);
    } else {
      // Si no hay timer, abrir el modal para configurar
      setShowRestTimeModal(true);
    }
  };

  const openSetTypeMenu = (setId) => {
    setEditingSetId(setId);
    setShowSetTypeModal(true);
  };

  const selectSetType = (typeId) => {
    onSetUpdate(exercise.id, editingSetId, "type", typeId);
    setShowSetTypeModal(false);
    setEditingSetId(null);
  };

  const removeSet = () => {
    onRemoveSet(exercise.id, editingSetId);
    setShowSetTypeModal(false);
    setEditingSetId(null);
  };

  const openRestTimeMenu = () => {
    setShowRestTimeModal(true);
  };

  const selectRestTime = (seconds) => {
    // Si el tiempo seleccionado es diferente al global, configurar como personalizado
    if (seconds !== globalRestSeconds) {
      setExerciseRest(exercise.id, seconds);
    } else {
      // Si es igual al global, usar el global
      setExerciseRest(exercise.id, null, { useGlobal: true });
    }
    setShowRestTimeModal(false);
  };

  return (
    <>
      <div className="wp-workout-exercise-card card-visible">
        <div className="wp-card-header">
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="wp-card-image"
          />
          <div className="wp-card-info">
            <h4>{exercise.name}</h4>
            <button
              className={`wp-card-rest-timer ${restTimeRemaining > 0 ? "active" : ""}`}
              onClick={handleRestTimerClick}
            >
              <Timer size={14} />
              <span>
                {restTimeRemaining > 0 
                  ? formatTime(restTimeRemaining) 
                  : exerciseRestTime > 0 
                    ? formatTime(exerciseRestTime)
                    : "Descanso"
                }
              </span>
            </button>
          </div>
          <button className="wp-card-menu">
            <MoreVertical size={18} />
          </button>
        </div>

        <div className="wp-notes-input-container">
          <Edit2 className="wp-notes-icon" size={16} />
          <input
            type="text"
            className="wp-notes-input"
            placeholder="Añadir notas..."
            value={exercise.notes}
            onChange={(e) =>
              onSetUpdate(exercise.id, null, "notes", e.target.value)
            }
          />
        </div>

        <div className="wp-card-table">
          <div className="wp-table-row header">
            <div>Set</div>
            <div className="col-prev">Anterior</div>
            <div className="col-kg">Kg</div>
            <div className="col-reps">Reps</div>
            <div className="col-check"></div>
          </div>
          {exercise.sets.map((set) => (
            <div
              key={set.id}
              className={`wp-table-row ${set.done ? "done" : ""}`}
            >
              <button
                className={`wp-set-type-btn ${set.type}`}
                onClick={() => openSetTypeMenu(set.id)}
              >
                {set.type}
              </button>
              <div className="col-prev">
                {set.prev_kg}kg × {set.prev_reps}
              </div>
              <input
                type="number"
                className="col-kg"
                value={set.kg}
                data-set-id={set.id}
                data-field="kg"
                onChange={(e) =>
                  onSetUpdate(exercise.id, set.id, "kg", e.target.value)
                }
              />
              <input
                type="number"
                className="col-reps"
                value={set.reps}
                data-set-id={set.id}
                data-field="reps"
                onChange={(e) =>
                  onSetUpdate(exercise.id, set.id, "reps", e.target.value)
                }
              />
              <div className="col-check">
                <button
                  className="wp-check-btn"
                  onClick={() => toggleSetDone(set.id)}
                >
                  {set.done && <Check size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          className="lifty-btn-secondary-dark wp-add-set-btn"
          onClick={() => onAddSet(exercise.id)}
        >
          <Plus size={16} />
          Añadir Set
        </button>
      </div>

      {showSetTypeModal && (
        <SetTypeModal
          onClose={() => {
            setShowSetTypeModal(false);
            setEditingSetId(null);
          }}
          onSelectType={selectSetType}
          onRemove={removeSet}
        />
      )}

      {showRestTimeModal && (
        <RestTimeModal
          onClose={() => setShowRestTimeModal(false)}
          onSelectTime={selectRestTime}
          currentTime={exerciseRestTime}
        />
      )}
    </>
  );
};

// SetTypeModal component
const SetTypeModal = ({ onClose, onSelectType, onRemove }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [infoContent, setInfoContent] = useState({
    title: "",
    description: "",
  });

  const setTypes = [
    {
      id: "N",
      name: "Normal",
      description:
        "Serie de trabajo estándar. El tipo de set más común utilizado para la mayoría de ejercicios con peso moderado a pesado.",
    },
    {
      id: "W",
      name: "Warm Up",
      description:
        "Series de calentamiento realizadas con pesos ligeros para preparar tu cuerpo para ejercicios más intensos. Ayudan a soltar las articulaciones, aumentar el ritmo cardíaco y mejorar el flujo sanguíneo a los músculos, reduciendo el riesgo de lesiones.",
    },
    {
      id: "F",
      name: "Failure",
      description:
        "Trabajar hasta el fallo muscular, donde no puedes completar otra repetición con la forma correcta, maximizando el crecimiento muscular y la fuerza.",
    },
    {
      id: "L",
      name: "Left",
      description:
        "Series dirigidas específicamente al lado izquierdo del cuerpo para entrenamiento unilateral y equilibrio muscular.",
    },
    {
      id: "R",
      name: "Right",
      description:
        "Series dirigidas específicamente al lado derecho del cuerpo para entrenamiento unilateral y equilibrio muscular.",
    },
    {
      id: "FD",
      name: "Feeder Set",
      description:
        "Series ligeras de altas repeticiones utilizadas para aumentar el flujo sanguíneo y promover la recuperación entre sesiones de entrenamiento pesado.",
    },
    {
      id: "T",
      name: "Top Set",
      description:
        "Tu serie de trabajo más pesada del ejercicio, típicamente realizada después de las series de calentamiento para lograr máxima intensidad.",
    },
    {
      id: "B",
      name: "Back-Off Set",
      description:
        "Realizada después de series pesadas con peso reducido para mantener el volumen de entrenamiento mientras se maneja la fatiga.",
    },
    {
      id: "D",
      name: "Drop Set",
      description:
        "Después de alcanzar el fallo, reduce inmediatamente el peso y continúa con más repeticiones para agotar completamente el músculo.",
    },
  ];

  const showInfo = (type) => {
    setInfoContent({ title: type.name, description: type.description });
    setShowInfoModal(true);
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setIsDragging(false);
    setCurrentY(0);
    setStartY(0);
  };

  return (
    <div className="wp-modal-overlay" onClick={onClose}>
      <div
        className="wp-set-type-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        <div
          className="wp-modal-drag-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>
        <h4>Tipo de Set</h4>
        <div className="wp-set-type-list">
          {setTypes.map((type) => (
            <div key={type.id} className="wp-set-type-item-wrapper">
              <div
                className="wp-set-type-item"
                onClick={() => onSelectType(type.id)}
              >
                <div className={`wp-set-type-badge ${type.id}`}>{type.id}</div>
                <div className="wp-set-type-info">
                  <strong>{type.name}</strong>
                </div>
                <button
                  className="wp-set-type-help-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    showInfo(type);
                  }}
                >
                  ?
                </button>
              </div>
            </div>
          ))}
        </div>
        {showInfoModal && (
          <div
            className="wp-info-modal-overlay"
            onClick={() => setShowInfoModal(false)}
          >
            <div className="wp-info-modal" onClick={(e) => e.stopPropagation()}>
              <h3>{infoContent.title}</h3>
              <p>{infoContent.description}</p>
              <button
                className="wp-info-modal-close"
                onClick={() => setShowInfoModal(false)}
              >
                OK
              </button>
            </div>
          </div>
        )}
        <button
          className="lifty-btn-secondary-dark wp-remove-set-btn"
          onClick={onRemove}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            <line x1="10" x2="10" y1="11" y2="17" />
            <line x1="14" x2="14" y1="11" y2="17" />
          </svg>
          Eliminar Set
        </button>
      </div>
    </div>
  );
};

// RestTimeModal component
export default WorkoutPageExerciseCard;
