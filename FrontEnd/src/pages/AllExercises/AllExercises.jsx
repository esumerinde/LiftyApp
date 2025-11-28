import { useState, useEffect } from "react";
import { ArrowLeft, Dumbbell } from "lucide-react";
import ExerciseCard from "../../components/ExerciseCard/ExerciseCard";
import "./AllExercises.css";

const AllExercises = () => {
  const [view, setView] = useState("groups"); // 'groups' | 'exercises'
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupThumbnails, setGroupThumbnails] = useState({});

  // Traducción de grupos musculares a español (solo los presentes en la base de datos)
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

  useEffect(() => {
    fetchMuscleGroups();
  }, []);

  const fetchMuscleGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/api/muscle-groups");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Ordenar grupos alfabéticamente por traducción en español
      const sortedGroups = (Array.isArray(data) ? data : []).sort((a, b) => {
        const nameA = muscleGroupTranslations[a.name] || a.name;
        const nameB = muscleGroupTranslations[b.name] || b.name;
        return nameA.localeCompare(nameB, "es");
      });

      setMuscleGroups(sortedGroups);

      // Cargar todos los ejercicios para obtener thumbnails
      const exercisesResponse = await fetch(
        "http://localhost:3000/api/exercises"
      );
      if (exercisesResponse.ok) {
        const allExercises = await exercisesResponse.json();
        const thumbnails = {};

        // Obtener la primera imagen de cada grupo
        data.forEach((group) => {
          const firstExercise = allExercises.find(
            (ex) => ex.muscle_group_name === group.name
          );
          if (firstExercise) {
            thumbnails[group.name] = firstExercise.image_url;
          }
        });

        setGroupThumbnails(thumbnails);
      }
    } catch (error) {
      console.error("Error fetching muscle groups:", error);
      setError(
        "Error al cargar los grupos musculares. Verifica que el backend esté funcionando."
      );
      setMuscleGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchExercises = async (muscleGroupId = null) => {
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
    } catch (error) {
      console.error("Error fetching exercises:", error);
      setError(
        "Error al cargar los ejercicios. Verifica que el backend esté funcionando."
      );
      setExercises([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupClick = (group) => {
    if (group === "all") {
      setSelectedGroup({ name: "Todos los Músculos", id_muscle_group: "all" });
      fetchExercises(); // Sin filtro, trae todos
    } else {
      setSelectedGroup(group);
      fetchExercises(group.id_muscle_group);
    }
    setView("exercises");
  };

  // Función para agrupar ejercicios por grupo muscular
  const groupExercisesByMuscle = () => {
    if (!exercises.length) return {};

    const grouped = {};
    exercises.forEach((exercise) => {
      const groupName = exercise.muscle_group_name || "Otros";
      if (!grouped[groupName]) {
        grouped[groupName] = [];
      }
      grouped[groupName].push(exercise);
    });

    return grouped;
  };

  const handleBack = () => {
    setView("groups");
    setSelectedGroup(null);
    setExercises([]);
  };

  return (
    <div className="lifty-exercises-page">
      <div className="lifty-exercises-container">
        {view === "groups" ? (
          <>
            {/* Header */}
            <header className="lifty-exercises-header">
              <h1 className="lifty-exercises-title">Todos los Ejercicios</h1>
              <p className="lifty-exercises-subtitle">
                Descubre ejercicios organizados por grupo muscular
              </p>
            </header>

            {/* Error Message */}
            {error && (
              <div className="lifty-exercises-error">
                <p>{error}</p>
              </div>
            )}

            {/* Grid de Grupos Musculares */}
            <div className="lifty-muscle-groups-grid">
              {loading ? (
                <div className="lifty-exercises-loading">
                  <div className="lifty-exercises-spinner"></div>
                  <p>Cargando grupos musculares...</p>
                </div>
              ) : muscleGroups.length > 0 ? (
                <>
                  {/* Cards de grupos musculares con imágenes reales */}
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
                              muscleGroupTranslations[group.name] || group.name
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

                  {/* Card "Todos" - última card con logo */}
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
            {/* Header de Ejercicios */}
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

            {/* Lista de Ejercicios */}
            <div className="lifty-exercises-list">
              {loading ? (
                <div className="lifty-exercises-loading">
                  <div className="lifty-exercises-spinner"></div>
                  <p>Cargando ejercicios...</p>
                </div>
              ) : exercises.length > 0 ? (
                selectedGroup?.id_muscle_group === "all" ? (
                  // Vista agrupada para "Todos los Ejercicios"
                  Object.entries(groupExercisesByMuscle()).map(
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
                            <ExerciseCard
                              key={exercise.id_exercise}
                              exercise={exercise}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  )
                ) : (
                  // Vista simple para un grupo específico
                  exercises.map((exercise) => (
                    <ExerciseCard
                      key={exercise.id_exercise}
                      exercise={exercise}
                    />
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
    </div>
  );
};

export default AllExercises;
