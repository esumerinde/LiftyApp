import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ClipboardList, Play, Dumbbell, User } from "lucide-react";
import RoutineCard from "../../components/RoutineCard/RoutineCard";
import {
  getFeaturedRoutines,
  getMyRoutines,
  getSavedRoutines,
  saveRoutineForUser,
  unsaveRoutineForUser,
} from "../../services/routinesService";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import { useAuth } from "../../context/AuthContext";
import "./Routines.css";

const Routines = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isActive: isWorkoutActive } = useActiveWorkout();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("rutinas");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [myRoutines, setMyRoutines] = useState([]);
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [savedRoutineIds, setSavedRoutineIds] = useState(new Set());
  const [savingRoutineIds, setSavingRoutineIds] = useState(new Set());
  const [featuredRoutines, setFeaturedRoutines] = useState({
    trending: [],
    popular: [],
    trainers: [],
    recommended: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      const [savedResult, myRoutinesResult, featuredResult] = await Promise.all(
        [getSavedRoutines(), getMyRoutines(), getFeaturedRoutines()]
      );

      if (savedResult.success) {
        const savedData = savedResult.data || [];
        setSavedRoutines(savedData);
        setSavedRoutineIds(
          new Set(savedData.map((routine) => routine.id_routine))
        );
      } else if (savedResult.message) {
        console.error("Error cargando rutinas guardadas:", savedResult.message);
      }

      if (myRoutinesResult.success) {
        setMyRoutines(myRoutinesResult.data || []);
      }

      // featuredResult viene envuelto en {success, data}
      if (featuredResult.success && featuredResult.data) {
        setFeaturedRoutines({
          trending: featuredResult.data.trending || [],
          popular: featuredResult.data.popular || [],
          trainers: featuredResult.data.trainers || [],
          recommended: featuredResult.data.recommended || [],
        });
      }
    } catch (error) {
      console.error("Error cargando rutinas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filters = [
    { id: "all", label: "Todas" },
    { id: "my-routines", label: "Mis Rutinas" },
    { id: "trending", label: "Tendencia" },
    { id: "popular", label: "Populares" },
    { id: "trainers", label: "Entrenadores" },
    { id: "recommended", label: "Recomendadas" },
  ];

  useEffect(() => {
    const filterParam = searchParams.get("filter");

    if (filterParam && filterParam !== activeFilter) {
      const validFilter = filters.some((filter) => filter.id === filterParam);
      if (validFilter) {
        setActiveFilter(filterParam);
        return;
      }
    }

    if (!filterParam && activeFilter !== "all") {
      setActiveFilter("all");
    }
  }, [searchParams, activeFilter]);

  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId);
    if (filterId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ filter: filterId });
    }
  };

  // Obtener rutinas según filtro activo
  const getRoutinesByFilter = () => {
    switch (activeFilter) {
      case "my-routines":
        return savedRoutines.map((r) => ({ ...r, _category: "saved" }));
      case "trending":
        return (featuredRoutines.trending || []).map((r) => ({
          ...r,
          _category: "trending",
        }));
      case "popular":
        return (featuredRoutines.popular || []).map((r) => ({
          ...r,
          _category: "popular",
        }));
      case "trainers":
        return (featuredRoutines.trainers || []).map((r) => ({
          ...r,
          _category: "trainers",
        }));
      case "recommended":
        return (featuredRoutines.recommended || []).map((r) => ({
          ...r,
          _category: "recommended",
        }));
      case "all":
      default:
        // Combinar todas las rutinas con IDs únicos
        const combined = [
          ...savedRoutines.map((r) => ({ ...r, _category: "saved" })),
          ...myRoutines.map((r) => ({ ...r, _category: "mine" })),
          ...(featuredRoutines.trending || []).map((r) => ({
            ...r,
            _category: "trending",
          })),
          ...(featuredRoutines.popular || []).map((r) => ({
            ...r,
            _category: "popular",
          })),
          ...(featuredRoutines.trainers || []).map((r) => ({
            ...r,
            _category: "trainers",
          })),
          ...(featuredRoutines.recommended || []).map((r) => ({
            ...r,
            _category: "recommended",
          })),
        ];

        const uniqueMap = new Map();
        combined.forEach((routine) => {
          const routineId = routine.id_routine || routine.id_featured_routine;
          if (!routineId) return;
          if (!uniqueMap.has(routineId)) {
            uniqueMap.set(routineId, routine);
          }
        });

        return Array.from(uniqueMap.values());
    }
  };

  // Filtrar rutinas por búsqueda
  const filteredRoutines = getRoutinesByFilter().filter((routine) => {
    const routineName = routine.name || routine.title || "";
    return routineName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleSave = async (routineData, currentlySaved) => {
    const routineId =
      routineData?.id_routine || routineData?.id_featured_routine;

    if (!routineId) {
      return;
    }

    setSavingRoutineIds((prev) => {
      const next = new Set(prev);
      next.add(routineId);
      return next;
    });

    try {
      if (currentlySaved) {
        const result = await unsaveRoutineForUser(routineId);
        if (!result.success) {
          throw new Error(
            result.message || "Error al eliminar rutina guardada"
          );
        }

        setSavedRoutineIds((prev) => {
          const next = new Set(prev);
          next.delete(routineId);
          return next;
        });

        setSavedRoutines((prev) =>
          prev.filter((routine) => routine.id_routine !== routineId)
        );
      } else {
        const result = await saveRoutineForUser(routineId);
        if (!result.success) {
          throw new Error(result.message || "Error al guardar rutina");
        }

        setSavedRoutineIds((prev) => {
          const next = new Set(prev);
          next.add(routineId);
          return next;
        });

        setSavedRoutines((prev) => {
          if (prev.some((routine) => routine.id_routine === routineId)) {
            return prev;
          }

          const normalizedRoutine = {
            ...routineData,
            id_routine: routineId,
            name: routineData.name || routineData.title,
            exercises_count:
              routineData.exercises_count ??
              routineData.total_exercises ??
              routineData.exercisesCount ??
              0,
          };

          return [normalizedRoutine, ...prev];
        });
      }
    } catch (error) {
      console.error(error);
      window.alert(error.message || "Ocurrió un error al actualizar la rutina");
    } finally {
      setSavingRoutineIds((prev) => {
        const next = new Set(prev);
        next.delete(routineId);
        return next;
      });
    }
  };

  const handleGoToWorkoutHub = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/workout-hub");
  };

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(isWorkoutActive ? "/workout" : "/workout-hub");
  };

  return (
    <div className="home-page">
      {/* ========== TABS ========== */}
      <div className="home-tabs">
        <button
          className={`home-tab ${activeTab === "rutinas" ? "active" : ""}`}
          onClick={() => setActiveTab("rutinas")}
        >
          <ClipboardList size={20} strokeWidth={2} />
          <span>Rutinas</span>
        </button>
        <button
          className="home-tab"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/workout-hub");
          }}
        >
          <Play size={20} strokeWidth={2} />
          <span>Entrenar</span>
        </button>
        <button
          className="home-tab"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/profile");
          }}
        >
          <User size={20} strokeWidth={2} />
          <span>Perfil</span>
        </button>
      </div>

      {/* ========== HERO SECTION ========== */}
      <div className="home-hero">
        <h1 className="home-title">
          {activeTab === "rutinas"
            ? "Mis Rutinas"
            : activeTab === "entrenar"
            ? "Entrenar"
            : "Perfil"}
        </h1>
        <p className="home-subtitle">
          {activeTab === "rutinas"
            ? "Descubre y organiza tus rutinas de entrenamiento"
            : activeTab === "entrenar"
            ? "Comienza tu sesión de entrenamiento"
            : "Gestiona tu perfil y configuración"}
        </p>
      </div>

      {/* ========== CONTENT BY TAB ========== */}
      {activeTab === "rutinas" ? (
        <div className="lifty-page">
          {/* ========== HEADER ========== */}
          <header
            className="lifty-header"
            style={{ position: "relative", top: 0 }}
          >
            {/* Search Bar */}
            <div className="lifty-search-container">
              <Search className="lifty-search-icon" size={20} strokeWidth={2} />
              <input
                type="search"
                className="lifty-search-input"
                placeholder="Buscar rutinas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="lifty-filter-chips-container">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`lifty-filter-chip ${
                    activeFilter === filter.id ? "active" : ""
                  }`}
                  onClick={() => handleFilterSelect(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Botón Comenzar Entrenamiento Vacío */}
            <button
              className="start-empty-workout-btn"
              onClick={handleGoToWorkoutHub}
            >
              <Play size={20} strokeWidth={2} />
              Comenzar Entrenamiento Vacío
            </button>
          </header>

          {/* ========== CONTENT ========== */}
          <main className="lifty-content">
            {isLoading ? (
              <div className="lifty-loading-state">
                <div className="lifty-spinner"></div>
                <p>Cargando rutinas...</p>
              </div>
            ) : filteredRoutines.length === 0 ? (
              // Empty State
              <div className="lifty-empty-state">
                <ClipboardList
                  className="lifty-empty-state-icon"
                  size={64}
                  strokeWidth={1.5}
                />
                <h2 className="lifty-empty-state-title">No hay rutinas</h2>
                <p className="lifty-empty-state-text">
                  {searchTerm
                    ? "No se encontraron rutinas con ese nombre"
                    : "Aún no tienes rutinas creadas. ¡Crea tu primera rutina!"}
                </p>
              </div>
            ) : (
              // Lista de Rutinas
              <div className="lifty-content-grid">
                {filteredRoutines.map((routine, idx) => {
                  const normalizedRoutine = {
                    ...routine,
                    id_routine:
                      routine.id_routine || routine.id_featured_routine,
                    name: routine.name || routine.title,
                    exercises_count:
                      routine.exercises_count ??
                      routine.total_exercises ??
                      routine.exercisesCount ??
                      0,
                  };

                  const routineId = normalizedRoutine.id_routine;
                  const isSaved = routineId
                    ? savedRoutineIds.has(routineId)
                    : false;
                  const isSaving = routineId
                    ? savingRoutineIds.has(routineId)
                    : false;

                  // Determinar si la rutina pertenece al usuario actual
                  const isOwnRoutine =
                    user &&
                    (normalizedRoutine.creator_id === user.id_user ||
                      normalizedRoutine.creator_id === user.id);

                  return (
                    <RoutineCard
                      key={`${routineId || "f"}_${idx}`}
                      routine={normalizedRoutine}
                      isSaved={isSaved}
                      isSaving={isSaving}
                      onToggleSave={handleToggleSave}
                      category={normalizedRoutine._category}
                      isOwnRoutine={isOwnRoutine}
                    />
                  );
                })}
              </div>
            )}
          </main>

          {/* ========== FAB (Floating Action Button) ========== */}
          <button
            className="lifty-fab-action"
            onClick={handleFabClick}
            aria-label={
              isWorkoutActive ? "Volver al entrenamiento" : "Entrenar"
            }
          >
            <Dumbbell
              className="lifty-fab-action-icon"
              size={24}
              strokeWidth={2}
            />
            <span className="lifty-fab-action-label">
              {isWorkoutActive ? "Volver" : "Entrenar"}
            </span>
          </button>
        </div>
      ) : activeTab === "entrenar" ? (
        <div className="lifty-page">
          <div className="lifty-empty-state">
            <Play
              className="lifty-empty-state-icon"
              size={64}
              strokeWidth={1.5}
            />
            <h2 className="lifty-empty-state-title">Entrenar</h2>
            <p className="lifty-empty-state-text">
              Contenido de entrenamiento próximamente
            </p>
          </div>
        </div>
      ) : (
        <div className="lifty-page">
          <div className="lifty-empty-state">
            <User
              className="lifty-empty-state-icon"
              size={64}
              strokeWidth={1.5}
            />
            <h2 className="lifty-empty-state-title">Perfil</h2>
            <p className="lifty-empty-state-text">
              Contenido de perfil próximamente
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Routines;
