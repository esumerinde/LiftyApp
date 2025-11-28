import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  X,
  Check,
  Edit2,
  MoreVertical,
  Save,
  ArrowLeft,
  Timer,
} from "lucide-react";
import { createRoutine } from "../../services/routinesService";
import { getAllExercises, getMuscleGroups } from "../../services/exercisesService";
import "./RoutineBuilder.css";

const STORAGE_KEY = "lifty-routine-builder-draft";

// Mapeo de nombres de grupos musculares a español
const MUSCLE_GROUP_TRANSLATIONS = {
  'Chest': 'Pecho',
  'Back': 'Espalda',
  'Legs': 'Piernas',
  'Arms': 'Brazos',
  'Shoulders': 'Hombros',
  'Core': 'Core',
  'Cardio': 'Cardio',
  'Full Body': 'Cuerpo Completo',
  'Glutes': 'Glúteos',
  'Calves': 'Pantorrillas',
  'Forearms': 'Antebrazos',
  'Abs': 'Abdominales'
};

const setTypes = [
  {
    id: "W",
    name: "Warm Up",
    description: "Set de calentamiento, no cuenta para el volumen.",
  },
  { id: "F", name: "Failure", description: "Set llevado al fallo muscular." },
  {
    id: "L",
    name: "Left",
    description: "Ejercicio unilateral, lado izquierdo.",
  },
  {
    id: "R",
    name: "Right",
    description: "Ejercicio unilateral, lado derecho.",
  },
  { id: "D", name: "Drop Set", description: "Set con reducción de peso." },
  { id: "N", name: "Normal", description: "Set estándar." },
  { id: "T", name: "Timed", description: "Set por tiempo, no repeticiones." },
  { id: "B", name: "BW", description: "Ejercicio con peso corporal." },
];

// ==========================================================
// COMPONENTE PRINCIPAL - ROUTINE BUILDER
// ==========================================================
const RoutineBuilder = () => {
  const navigate = useNavigate();

  const [routineName, setRoutineName] = useState("");
  const [routineDescription, setRoutineDescription] = useState("");
  const [exercises, setExercises] = useState([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  // Cargar draft del localStorage al montar
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setRoutineName(draft.routineName || "");
        setRoutineDescription(draft.routineDescription || "");
        setExercises(draft.exercises || []);
      } catch (error) {
        console.error("Error al cargar draft:", error);
      }
    }
  }, []);

  // Guardar draft en localStorage cada vez que cambian los datos
  useEffect(() => {
    const draft = {
      routineName,
      routineDescription,
      exercises,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [routineName, routineDescription, exercises]);

  const handleAddExercises = () => {
    setShowAddExerciseModal(true);
  };

  const handleExercisesSelected = (selectedExercises) => {
    const newExercises = selectedExercises.map((ex, index) => ({
      ...ex,
      id: ex.id_exercise, // Usar id_exercise como id para compatibilidad interna
      sets: [
        {
          id: Date.now() + index,
          type: "N",
          kg: "",
          reps: "",
        },
      ],
      notes: "",
      rest_timer: 90,
    }));
    setExercises([...exercises, ...newExercises]);
    setShowAddExerciseModal(false);
  };

  const handleSave = async () => {
    if (!routineName.trim()) {
      alert("Por favor ingresa un nombre para la rutina");
      return;
    }

    if (exercises.length === 0) {
      alert("Agrega al menos un ejercicio a la rutina");
      return;
    }

    // Preparar datos para enviar al backend
    const routineData = {
      name: routineName,
      description: routineDescription || "",
      exercises: exercises.map((ex) => ({
        id_exercise: ex.id,
        notes: ex.notes || "",
        rest_timer: ex.rest_timer || 90,
        sets: ex.sets.map((set) => ({
          type: set.type,
          kg: set.kg || null,
          reps: set.reps || null,
          prev_kg: set.prev_kg || null,
          prev_reps: set.prev_reps || null,
        })),
      })),
    };

    console.log("Guardando rutina:", routineData);

    const result = await createRoutine(routineData);
    
    if (result.success) {
      // Limpiar el draft después de guardar
      localStorage.removeItem(STORAGE_KEY);
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate("/routines");
    } else {
      alert(result.message || "Error al guardar la rutina");
    }
  };

  const handleCancel = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(-1);
  };

  const handleSetUpdate = (exerciseId, setId, field, value) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id === setId ? { ...s, [field]: value } : s
            ),
          };
        }
        return ex;
      })
    );
  };

  const handleAddSet = (exerciseId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          const lastSet = ex.sets[ex.sets.length - 1];
          return {
            ...ex,
            sets: [
              ...ex.sets,
              {
                id: Date.now(),
                type: lastSet?.type || "N",
                kg: lastSet?.kg || "",
                reps: lastSet?.reps || "",
              },
            ],
          };
        }
        return ex;
      })
    );
  };

  const handleRemoveSet = (exerciseId, setId) => {
    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === exerciseId) {
          return {
            ...ex,
            sets: ex.sets.filter((s) => s.id !== setId),
          };
        }
        return ex;
      })
    );
  };

  const handleRemoveExercise = (exerciseId) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
  };

  return (
    <div className="routine-builder">
      {showAddExerciseModal ? (
        <AddExerciseModal
          onClose={() => setShowAddExerciseModal(false)}
          onSelect={handleExercisesSelected}
        />
      ) : (
        <div className="routine-builder-content">
          <div className="routine-builder-header">
            <button className="back-btn" onClick={handleCancel}>
              <ArrowLeft size={20} />
            </button>
            <h3>Nueva Rutina</h3>
            <button className="save-btn" onClick={handleSave}>
              <Save size={20} />
              Guardar
            </button>
          </div>

          <div className="routine-metadata">
            <input
              type="text"
              className="routine-name-input"
              placeholder="Nombre de la rutina"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
            />
            <textarea
              className="routine-description-input"
              placeholder="Descripción (opcional)"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="exercise-list">
            {exercises.length === 0 ? (
              <div className="no-exercises-placeholder">
                <p>Añade ejercicios a tu rutina</p>
              </div>
            ) : (
              exercises.map((ex) => (
                <RoutineExerciseCard
                  key={ex.id}
                  exercise={ex}
                  onSetUpdate={handleSetUpdate}
                  onAddSet={handleAddSet}
                  onRemoveSet={handleRemoveSet}
                  onRemoveExercise={handleRemoveExercise}
                />
              ))
            )}
          </div>

          <div className="routine-builder-footer">
            {exercises.length === 0 ? (
              <button className="footer-btn-primary" onClick={handleAddExercises}>
                <Plus size={20} strokeWidth={2} />
                Añadir Ejercicios
              </button>
            ) : (
              <div className="footer-buttons-row">
                <button className="footer-btn-secondary" onClick={handleAddExercises}>
                  <Plus size={18} strokeWidth={2} />
                  Añadir Más
                </button>
                <button className="footer-btn-primary" onClick={handleSave}>
                  <Check size={20} strokeWidth={2.5} />
                  Finalizar Rutina
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================================
// COMPONENTE: Card de Ejercicio
// ==========================================================
const RoutineExerciseCard = ({
  exercise,
  onSetUpdate,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}) => {
  const [showSetTypeModal, setShowSetTypeModal] = useState(false);
  const [showExerciseMenu, setShowExerciseMenu] = useState(false);
  const [editingSetId, setEditingSetId] = useState(null);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    if (!showExerciseMenu) return;
    
    const handleClickOutside = () => setShowExerciseMenu(false);
    document.addEventListener('click', handleClickOutside);
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showExerciseMenu]);

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

  return (
    <>
      <div className="routine-exercise-card">
        <div className="re-card-header">
          <img
            src={exercise.image_url}
            alt={exercise.name}
            className="re-card-image"
          />
          <div className="re-card-info">
            <h4>{exercise.name}</h4>
            <div className="re-card-rest-timer">
              <Timer size={14} /> {exercise.rest_timer}s
            </div>
          </div>
          <button 
            className="re-card-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowExerciseMenu(!showExerciseMenu);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {showExerciseMenu && (
            <div className="re-exercise-menu">
              <button 
                className="re-menu-delete"
                onClick={() => {
                  if (window.confirm('¿Eliminar este ejercicio de la rutina?')) {
                    onRemoveExercise(exercise.id);
                  }
                  setShowExerciseMenu(false);
                }}
              >
                Eliminar Ejercicio
              </button>
            </div>
          )}
        </div>

        <div className="notes-input-container">
          <Edit2 className="notes-icon" size={16} />
          <input
            type="text"
            className="notes-input"
            placeholder="Añadir notas..."
            value={exercise.notes}
            onChange={(e) =>
              onSetUpdate(exercise.id, null, "notes", e.target.value)
            }
          />
        </div>

        <div className="re-card-table">
          <div className="re-table-row header">
            <div>Set</div>
            <div className="col-kg">Kg</div>
            <div className="col-reps">Reps</div>
          </div>
          {exercise.sets.map((set) => (
            <div key={set.id} className="re-table-row">
              <button
                className={`set-type-btn ${set.type}`}
                onClick={() => openSetTypeMenu(set.id)}
              >
                {set.type}
              </button>
              <input
                type="number"
                className="col-kg"
                value={set.kg}
                onChange={(e) =>
                  onSetUpdate(exercise.id, set.id, "kg", e.target.value)
                }
              />
              <input
                type="number"
                className="col-reps"
                value={set.reps}
                onChange={(e) =>
                  onSetUpdate(exercise.id, set.id, "reps", e.target.value)
                }
              />
            </div>
          ))}
        </div>

        <button className="add-set-btn" onClick={() => onAddSet(exercise.id)}>
          + Añadir Set
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
    </>
  );
};

// ==========================================================
// MODAL: Seleccionar Tipo de Set
// ==========================================================
const SetTypeModal = ({ onClose, onSelectType, onRemove }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="set-type-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-drag-handle"></div>
        <h4>Tipo de Set</h4>
        <div className="set-type-list">
          {setTypes.map((type) => (
            <div
              key={type.id}
              className="set-type-item"
              onClick={() => onSelectType(type.id)}
            >
              <div className={`set-type-badge ${type.id}`}>{type.id}</div>
              <div className="set-type-info">
                <strong>{type.name}</strong>
                <small>{type.description}</small>
              </div>
            </div>
          ))}
        </div>
        <button className="remove-set-btn" onClick={onRemove}>
          <X size={18} /> Eliminar Set
        </button>
      </div>
    </div>
  );
};

// ==========================================================
// MODAL: Añadir Ejercicios
// ==========================================================
const AddExerciseModal = ({ onClose, onSelect }) => {
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [allExercises, setAllExercises] = useState([]);
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar ejercicios y grupos musculares al montar
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      const [exercisesResult, groupsResult] = await Promise.all([
        getAllExercises(),
        getMuscleGroups()
      ]);

      if (exercisesResult.success) {
        setAllExercises(exercisesResult.data);
      }

      if (groupsResult.success) {
        // Agregar "Todos" al inicio y traducir nombres
        const translatedGroups = groupsResult.data.map(group => ({
          ...group,
          name: MUSCLE_GROUP_TRANSLATIONS[group.name] || group.name
        }));
        
        setMuscleGroups([
          { id_muscle_group: "all", name: "Todos" },
          ...translatedGroups
        ]);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  const filteredExercises =
    muscleFilter === "all"
      ? allExercises
      : allExercises.filter((ex) => ex.id_muscle_group === parseInt(muscleFilter));

  const toggleExercise = (exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.find((e) => e.id_exercise === exercise.id_exercise);
      if (exists) {
        return prev.filter((e) => e.id_exercise !== exercise.id_exercise);
      }
      return [...prev, exercise];
    });
  };

  const isSelected = (exerciseId) => {
    return selectedExercises.some((e) => e.id_exercise === exerciseId);
  };

  return (
    <div className="add-exercise-modal">
      <div className="add-ex-header">
        <h4>Añadir Ejercicios</h4>
        <button onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="muscle-filter-scroll">
        {muscleGroups.map((group) => (
          <button
            key={group.id_muscle_group}
            className={`muscle-filter-chip ${
              muscleFilter === group.id_muscle_group.toString() ? "active" : ""
            }`}
            onClick={() => setMuscleFilter(group.id_muscle_group.toString())}
          >
            {group.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="add-ex-grid">
          <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px" }}>
            Cargando ejercicios...
          </p>
        </div>
      ) : (
        <div className="add-ex-grid">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id_exercise}
              className={`add-ex-card ${
                isSelected(exercise.id_exercise) ? "selected" : ""
              }`}
              onClick={() => toggleExercise(exercise)}
            >
              {isSelected(exercise.id_exercise) && (
                <div className="add-ex-selected-check">
                  <Check size={14} />
                </div>
              )}
              <img
                src={exercise.image_url}
                alt={exercise.name}
                className="add-ex-image"
              />
              <div className="add-ex-name-overlay">
                <span className="add-ex-name">{exercise.name}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="add-ex-footer">
        <button
          className="footer-btn-primary"
          onClick={() => onSelect(selectedExercises)}
          disabled={selectedExercises.length === 0}
        >
          Añadir{" "}
          {selectedExercises.length > 0 && `(${selectedExercises.length})`}
        </button>
      </div>
    </div>
  );
};

export default RoutineBuilder;
