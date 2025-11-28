import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bookmark, ClipboardList } from "lucide-react";
import RoutineCard from "../../components/RoutineCard/RoutineCard";
import {
  getSavedRoutines,
  saveRoutineForUser,
  unsaveRoutineForUser,
} from "../../services/routinesService";
import "./MySavedRoutines.css";

const MySavedRoutines = () => {
  const navigate = useNavigate();
  const [savedRoutines, setSavedRoutines] = useState([]);
  const [routineIdsSet, setRoutineIdsSet] = useState(new Set());
  const [savingRoutineIds, setSavingRoutineIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedRoutines();
  }, []);

  const loadSavedRoutines = async () => {
    setIsLoading(true);
    try {
      const result = await getSavedRoutines();
      if (result.success) {
        const data = result.data || [];
        setSavedRoutines(data);
        setRoutineIdsSet(new Set(data.map((routine) => routine.id_routine)));
      } else {
        console.error(
          "Error al cargar rutinas guardadas:",
          result.message || result.error
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSave = async (routineData, currentlySaved) => {
    const routineId = routineData?.id_routine || routineData?.id;

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

        setRoutineIdsSet((prev) => {
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

        setRoutineIdsSet((prev) => {
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

  const isEmpty = !isLoading && savedRoutines.length === 0;

  return (
    <div className="saved-routines-page lifty-page">
      <header className="lifty-header saved-routines-header">
        <button
          className="lifty-back-btn"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Volver"
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>

        <h1 className="lifty-page-title">Mis Rutinas Guardadas</h1>
        <p className="saved-routines-subtitle">
          Tus rutinas favoritas listas para comenzar cuando quieras.
        </p>

        <button
          className="start-empty-workout-btn"
          type="button"
          onClick={() => navigate("/routines")}
        >
          <ClipboardList size={20} strokeWidth={2} />
          Explorar todas las rutinas
        </button>
      </header>

      <main className="lifty-content saved-routines-content">
        {isLoading ? (
          <div className="lifty-loading-state">
            <div className="lifty-spinner" />
            <p>Cargando tus rutinas guardadas...</p>
          </div>
        ) : isEmpty ? (
          <div className="saved-routines-empty">
            <Bookmark
              className="saved-routines-empty-icon"
              size={64}
              strokeWidth={1.5}
            />
            <h2>No tienes rutinas guardadas</h2>
            <p>
              Guarda tus rutinas favoritas para tenerlas siempre a mano desde
              esta sección.
            </p>
          </div>
        ) : (
          <div className="lifty-content-grid">
            {savedRoutines.map((routine, index) => {
              const normalizedRoutine = {
                ...routine,
                id_routine: routine.id_routine,
                name: routine.name || routine.title,
                exercises_count:
                  routine.exercises_count ??
                  routine.total_exercises ??
                  routine.exercisesCount ??
                  0,
              };

              const routineId = normalizedRoutine.id_routine;
              const isSaved = routineId ? routineIdsSet.has(routineId) : false;
              const isSaving = routineId
                ? savingRoutineIds.has(routineId)
                : false;

              return (
                <RoutineCard
                  key={`${routineId}_${index}`}
                  routine={normalizedRoutine}
                  isSaved={isSaved}
                  isSaving={isSaving}
                  onToggleSave={handleToggleSave}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MySavedRoutines;
