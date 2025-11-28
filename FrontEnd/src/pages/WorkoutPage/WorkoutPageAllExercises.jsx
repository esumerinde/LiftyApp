import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Dumbbell, Check, Plus } from "lucide-react";
import ExerciseCard from "../../components/ExerciseCard/ExerciseCard";
import "./WorkoutPageAllExercises.css";

const WorkoutPageAllExercises = ({ onClose, onSelect }) => {
  const [view, setView] = useState("groups");
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupThumbnails, setGroupThumbnails] = useState({});
  const [selectedExercises, setSelectedExercises] = useState([]);

  const muscleGroupTranslations = {
    Chest: "Pecho",
    Back: "Espalda",
    Shoulders: "Hombros",
    Legs: "Piernas",
    Biceps: "Bíceps",
    Triceps: "Tríceps",
    Calves: "Pantorrillas",
    Cardio: "Cardio",
    Calentamiento: "Calentamiento",
  };

  const safeScrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Ocultar BottomNav cuando estemos en la vista de ejercicios
  useEffect(() => {
    const nav = document.querySelector('nav.bottom-nav');
    if (view === 'exercises') {
      document.body.classList.add('hide-bottom-nav');
      if (nav) nav.style.display = 'none';
    } else {
      document.body.classList.remove('hide-bottom-nav');
      if (nav) nav.style.display = '';
    }

    return () => {
      document.body.classList.remove('hide-bottom-nav');
      if (nav) nav.style.display = '';
    };
  }, [view]);

  useEffect(() => {
    const loadMuscleGroups = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("http://localhost:3000/api/muscle-groups");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const groupsArray = Array.isArray(data) ? data : [];

        const sortedGroups = groupsArray.sort((a, b) => {
          const nameA = muscleGroupTranslations[a.name] || a.name;
          const nameB = muscleGroupTranslations[b.name] || b.name;
          return nameA.localeCompare(nameB, "es");
        });

        setMuscleGroups(sortedGroups);

        // thumbnails
        const exercisesResponse = await fetch(
          "http://localhost:3000/api/exercises"
        );

        if (exercisesResponse.ok) {
          const allExercises = await exercisesResponse.json();
          const thumbnails = {};

          sortedGroups.forEach((group) => {
            const firstExercise = allExercises.find(
              (ex) => ex.muscle_group_name === group.name && ex.image_url
            );

            if (firstExercise) {
              thumbnails[group.name] = firstExercise.image_url;
            } else if (group.name === "Calentamiento") {
              thumbnails[group.name] = "/src/assets/Logo/LogoLiftyMini.png";
            }
          });

          setGroupThumbnails(thumbnails);
        }
      } catch (err) {
        console.error("Error fetching muscle groups:", err);
        setError(
          "Error al cargar los grupos musculares. Verifica que el backend esté funcionando."
        );
        setMuscleGroups([]);
        setGroupThumbnails({});
      } finally {
        setLoading(false);
      }
    };

    loadMuscleGroups();
  }, []);

  const fetchExercises = useCallback(async (muscleGroupId = null) => {
    setLoading(true);
    setError(null);

    try {
      const url = muscleGroupId
        ? `http://localhost:3000/api/exercises?muscleGroupId=${muscleGroupId}`
        : "http://localhost:3000/api/exercises";

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setExercises(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching exercises:", err);
      setError(
        "Error al cargar los ejercicios. Verifica que el backend esté funcionando."
      );
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGroupClick = useCallback(
    (group) => {
      if (group === "all") {
        setSelectedGroup({
          name: "Todos los Músculos",
          id_muscle_group: "all",
        });
        fetchExercises();
      } else {
        setSelectedGroup(group);
        fetchExercises(group.id_muscle_group);
      }

      setView("exercises");
      safeScrollTop();
    },
    [fetchExercises]
  );

  const groupedExercises = useMemo(() => {
    if (!exercises.length) return {};

    return exercises.reduce((acc, exercise) => {
      const groupName = exercise.muscle_group_name || "Otros";
      if (!acc[groupName]) acc[groupName] = [];
      acc[groupName].push(exercise);
      return acc;
    }, {});
  }, [exercises]);

  const handleBack = () => {
    setView("groups");
    setSelectedGroup(null);
    setExercises([]);
    safeScrollTop();
  };

  const toggleExercise = (exercise) => {
    setSelectedExercises((prev) => {
      const exists = prev.some((e) => e.id_exercise === exercise.id_exercise);
      if (exists) {
        return prev.filter((e) => e.id_exercise !== exercise.id_exercise);
      }
      return [...prev, exercise];
    });
  };

  const isSelected = (exerciseId) =>
    selectedExercises.some((e) => e.id_exercise === exerciseId);

  const handleAddExercises = () => {
    if (typeof onSelect === "function") {
      onSelect(selectedExercises);
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div className="wpae-modal-container">
      <div className="lifty-exercises-page">
        <div className="lifty-exercises-container">
          {view === "groups" ? (
            <>
              <header className="lifty-exercises-header">
                <button className="wpae-close-btn" onClick={onClose}>
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>
                <div className="lifty-exercises-header-content">
                  <h1 className="lifty-exercises-title">Añadir Ejercicios</h1>
                  <p className="lifty-exercises-subtitle">
                    Selecciona un grupo muscular
                  </p>
                </div>
              </header>

              {error && (
                <div className="lifty-exercises-error">
                  <p>{error}</p>
                </div>
              )}

              <div className="lifty-muscle-groups-grid">
                {loading ? (
                  <div className="lifty-exercises-loading">
                    <div className="lifty-exercises-spinner" />
                    <p>Cargando grupos musculares...</p>
                  </div>
                ) : muscleGroups.length > 0 ? (
                  <>
                    {muscleGroups.map((group) => (
                      <button
                        key={group.id_muscle_group}
                        className="lifty-muscle-group-card"
                        onClick={() => handleGroupClick(group)}
                      >
                        <div className="lifty-muscle-group-image">
                          {groupThumbnails[group.name] ? (
                            <img
                              src={groupThumbnails[group.name]}
                              alt={
                                muscleGroupTranslations[group.name] ||
                                group.name
                              }
                            />
                          ) : (
                            <div className="lifty-muscle-group-placeholder">
                              <span>💪</span>
                            </div>
                          )}
                        </div>

                        <h3 className="lifty-muscle-group-name">
                          {muscleGroupTranslations[group.name] || group.name}
                        </h3>
                      </button>
                    ))}

                    <button
                      className="lifty-muscle-group-card lifty-muscle-group-all"
                      onClick={() => handleGroupClick("all")}
                    >
                      <div className="lifty-muscle-group-all-icon">
                        <img
                          src="/src/assets/Logo/LogoLiftyMini.png"
                          alt="Lifty Logo"
                        />
                      </div>
                      <h3 className="lifty-muscle-group-name">Todos</h3>
                    </button>
                  </>
                ) : !error ? (
                  <div className="lifty-exercises-empty">
                    <Dumbbell size={64} strokeWidth={1.5} />
                    <p>No hay grupos musculares disponibles</p>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <header className="lifty-exercises-header">
                <button
                  className="lifty-exercises-back-btn"
                  onClick={handleBack}
                  aria-label="Volver a grupos musculares"
                >
                  <ArrowLeft size={24} strokeWidth={2} />
                </button>

                <div className="lifty-exercises-header-content">
                  <h1 className="lifty-exercises-title">
                    {selectedGroup?.name === "Todos los Músculos"
                      ? "Todos los Ejercicios"
                      : `Ejercicios de ${
                          muscleGroupTranslations[selectedGroup?.name] ||
                          selectedGroup?.name
                        }`}
                  </h1>
                  <p className="lifty-exercises-subtitle">
                    {exercises.length}{" "}
                    {exercises.length === 1
                      ? "ejercicio disponible"
                      : "ejercicios disponibles"}
                  </p>
                </div>
              </header>

              <div className="lifty-exercises-list">
                {loading ? (
                  <div className="lifty-exercises-loading">
                    <div className="lifty-exercises-spinner" />
                    <p>Cargando ejercicios...</p>
                  </div>
                ) : exercises.length > 0 ? (
                  selectedGroup?.id_muscle_group === "all" ? (
                    Object.entries(groupedExercises).map(
                      ([groupName, groupExercises]) => (
                        <div
                          key={groupName}
                          className="lifty-exercise-group-section"
                        >
                          <h2 className="lifty-exercise-group-title">
                            {muscleGroupTranslations[groupName] || groupName}
                          </h2>

                          <div className="lifty-exercise-group-grid">
                            {groupExercises.map((exercise) => (
                              <div
                                key={exercise.id_exercise}
                                className={`wpae-exercise-card-wrapper ${
                                  isSelected(exercise.id_exercise)
                                    ? "selected"
                                    : ""
                                }`}
                                onClick={() => toggleExercise(exercise)}
                              >
                                {isSelected(exercise.id_exercise) && (
                                  <div className="wpae-selected-check">
                                    <Check size={16} strokeWidth={3} />
                                  </div>
                                )}
                                <ExerciseCard exercise={exercise} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    exercises.map((exercise) => (
                      <div
                        key={exercise.id_exercise}
                        className={`wpae-exercise-card-wrapper ${
                          isSelected(exercise.id_exercise) ? "selected" : ""
                        }`}
                        onClick={() => toggleExercise(exercise)}
                      >
                        {isSelected(exercise.id_exercise) && (
                          <div className="wpae-selected-check">
                            <Check size={16} strokeWidth={3} />
                          </div>
                        )}
                        <ExerciseCard exercise={exercise} />
                      </div>
                    ))
                  )
                ) : (
                  <div className="lifty-exercises-empty">
                    <Dumbbell size={64} strokeWidth={1.5} />
                    <p>No hay ejercicios disponibles</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer con botón Añadir - solo visible cuando hay vista de ejercicios */}
        {view === "exercises" && (
          <div className="wpae-footer">
            <button
              className="lifty-btn-secondary-dark wpae-footer-add-btn"
              onClick={handleAddExercises}
              disabled={selectedExercises.length === 0}
            >
              <Plus size={18} strokeWidth={2} />
              Añadir{" "}
              {selectedExercises.length > 0 && `(${selectedExercises.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutPageAllExercises;
