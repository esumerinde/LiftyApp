import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_KEY = "lifty-active-workout-v1";
const DEFAULT_GLOBAL_REST = 90;

const ActiveWorkoutContext = createContext(null);

const defaultState = {
  isActive: false,
  startedAt: null,
  durationOffset: 0,
  workout: [],
  routineInfo: null,
  globalRestSeconds: DEFAULT_GLOBAL_REST,
  restTimers: {},
};

const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const normalizeSet = (set) => {
  const normalized = set || {};
  return {
    id: normalized.id || generateId(),
    type: normalized.type || "N",
    kg:
      normalized.kg !== undefined &&
      normalized.kg !== null &&
      normalized.kg !== ""
        ? String(normalized.kg)
        : "",
    reps:
      normalized.reps !== undefined &&
      normalized.reps !== null &&
      normalized.reps !== ""
        ? String(normalized.reps)
        : "",
    done: Boolean(normalized.done),
    prev_kg: normalized.prev_kg || 0,
    prev_reps: normalized.prev_reps || 0,
  };
};

const normalizeExercise = (exercise, globalRestSeconds) => {
  const source = exercise || {};
  const baseSets = Array.isArray(source.sets) ? source.sets : [];
  const sets =
    baseSets.length > 0
      ? baseSets.map((set) => normalizeSet(set))
      : [normalizeSet()];

  const rawCustomRest =
    source.customRestSeconds !== undefined && source.customRestSeconds !== null
      ? Number(source.customRestSeconds)
      : source.rest_timer !== undefined && source.rest_timer !== null
      ? Number(source.rest_timer)
      : null;

  const hasCustomRest =
    typeof source.usesCustomRest === "boolean"
      ? source.usesCustomRest
      : rawCustomRest !== null;

  return {
    id:
      source.id && typeof source.id === "string"
        ? source.id
        : `ex-${generateId()}`,
    id_exercise: source.id_exercise || source.id || null,
    name: source.name_exercise || source.name || "Ejercicio",
    image_url: source.image_url || source.thumbnail || null,
    notes: source.notes || "",
    usesCustomRest: hasCustomRest,
    customRestSeconds:
      hasCustomRest && rawCustomRest !== null
        ? Math.max(0, Number(rawCustomRest) || 0)
        : null,
    sets,
  };
};

const readStoredState = () => {
  if (typeof window === "undefined") {
    return { ...defaultState };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { ...defaultState };
  }

  try {
    const parsed = JSON.parse(raw);
    const sanitizedRestTimers = {};

    if (parsed.restTimers && typeof parsed.restTimers === "object") {
      Object.entries(parsed.restTimers).forEach(([key, timer]) => {
        if (timer && typeof timer === "object") {
          sanitizedRestTimers[key] = {
            startedAt: Number(timer.startedAt) || Date.now(),
            duration: Number(timer.duration) || 0,
          };
        }
      });
    }

    return {
      ...defaultState,
      ...parsed,
      isActive: Boolean(parsed.isActive),
      startedAt: parsed.startedAt ? Number(parsed.startedAt) : null,
      durationOffset: parsed.durationOffset ? Number(parsed.durationOffset) : 0,
      globalRestSeconds:
        typeof parsed.globalRestSeconds === "number"
          ? Math.max(0, parsed.globalRestSeconds)
          : DEFAULT_GLOBAL_REST,
      workout: Array.isArray(parsed.workout) ? parsed.workout : [],
      restTimers: sanitizedRestTimers,
    };
  } catch (error) {
    console.error("Failed to parse active workout from storage:", error);
    return { ...defaultState };
  }
};

const computeDurationSeconds = (startedAt, offset = 0) => {
  if (!startedAt) {
    return Math.max(0, offset || 0);
  }
  const elapsed = Math.floor((Date.now() - startedAt) / 1000);
  return Math.max(0, (offset || 0) + (elapsed > 0 ? elapsed : 0));
};

const getExerciseRestPreset = (exercise, globalRestSeconds) => {
  if (!exercise) {
    return globalRestSeconds;
  }
  if (exercise.usesCustomRest) {
    return typeof exercise.customRestSeconds === "number"
      ? Math.max(0, exercise.customRestSeconds)
      : 0;
  }
  return globalRestSeconds;
};

export const ActiveWorkoutProvider = ({ children }) => {
  const initialState = readStoredState();
  const [state, setState] = useState(initialState);
  const [durationSeconds, setDurationSeconds] = useState(() =>
    computeDurationSeconds(initialState.startedAt, initialState.durationOffset)
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!state.isActive) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (!state.isActive || !state.startedAt) {
      setDurationSeconds(state.durationOffset || 0);
      return;
    }

    const start = state.startedAt;
    const offset = state.durationOffset || 0;

    const updateDuration = () => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setDurationSeconds(Math.max(0, offset + (elapsed > 0 ? elapsed : 0)));
    };

    updateDuration();
    const intervalId = setInterval(updateDuration, 1000);

    return () => clearInterval(intervalId);
  }, [state.isActive, state.startedAt, state.durationOffset]);

  const startWorkout = useCallback(
    ({ exercises = [], routineInfo = null, startedAt } = {}) => {
      setState({
        isActive: true,
        startedAt: startedAt || Date.now(),
        durationOffset: 0,
        workout: exercises.map((exercise) =>
          normalizeExercise(exercise, DEFAULT_GLOBAL_REST)
        ),
        routineInfo: routineInfo
          ? {
              id: routineInfo.id_routine || routineInfo.id || null,
              name: routineInfo.name || routineInfo.title || null,
            }
          : null,
        globalRestSeconds: DEFAULT_GLOBAL_REST,
        restTimers: {},
      });
    },
    []
  );

  const resetWorkout = useCallback(() => {
    setState({ ...defaultState });
    setDurationSeconds(0);
  }, []);

  const resetDuration = useCallback(() => {
    setState((prev) => ({
      ...prev,
      startedAt: Date.now(),
      durationOffset: 0,
    }));
    setDurationSeconds(0);
  }, []);

  const addExercises = useCallback((exercises = []) => {
    if (!Array.isArray(exercises) || exercises.length === 0) {
      return;
    }

    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const normalized = exercises.map((exercise) =>
        normalizeExercise(exercise, prev.globalRestSeconds)
      );

      return {
        ...prev,
        workout: [...prev.workout, ...normalized],
      };
    });
  }, []);

  const updateExerciseField = useCallback((exerciseId, setId, field, value) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const workout = prev.workout.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (field === "notes" && setId == null) {
          if (exercise.notes === value) {
            return exercise;
          }
          return { ...exercise, notes: value };
        }

        if (setId == null) {
          return { ...exercise, [field]: value };
        }

        const sets = exercise.sets.map((set) =>
          set.id === setId ? { ...set, [field]: value } : set
        );

        return { ...exercise, sets };
      });

      return { ...prev, workout };
    });
  }, []);

  const addSet = useCallback((exerciseId) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const workout = prev.workout.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        const lastSet = exercise.sets[exercise.sets.length - 1];
        const template = lastSet || {};
        const newSet = normalizeSet({
          type: template.type || "N",
          kg: template.kg || "",
          reps: template.reps || "",
          done: false,
          prev_kg: template.prev_kg || 0,
          prev_reps: template.prev_reps || 0,
        });

        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      });

      return { ...prev, workout };
    });
  }, []);

  const removeSet = useCallback((exerciseId, setId) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const workout = prev.workout.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        return {
          ...exercise,
          sets: exercise.sets.filter((set) => set.id !== setId),
        };
      });

      return { ...prev, workout };
    });
  }, []);

  const setGlobalRestSeconds = useCallback((seconds) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      return {
        ...prev,
        globalRestSeconds: Math.max(0, Number(seconds) || 0),
      };
    });
  }, []);

  const setExerciseRest = useCallback((exerciseId, seconds, options = {}) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const workout = prev.workout.map((exercise) => {
        if (exercise.id !== exerciseId) {
          return exercise;
        }

        if (options.useGlobal || seconds === null || seconds === undefined) {
          return {
            ...exercise,
            usesCustomRest: false,
            customRestSeconds: null,
          };
        }

        const normalizedSeconds = Math.max(0, Number(seconds) || 0);
        return {
          ...exercise,
          usesCustomRest: true,
          customRestSeconds: normalizedSeconds,
        };
      });

      return { ...prev, workout };
    });
  }, []);

  const startRestTimer = useCallback((exerciseId, durationOverride) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const exercise = prev.workout.find((ex) => ex.id === exerciseId);
      if (!exercise) {
        return prev;
      }

      const duration =
        typeof durationOverride === "number"
          ? Math.max(0, durationOverride)
          : getExerciseRestPreset(exercise, prev.globalRestSeconds);

      if (!duration) {
        const { [exerciseId]: _removed, ...rest } = prev.restTimers;
        return { ...prev, restTimers: rest };
      }

      return {
        ...prev,
        restTimers: {
          ...prev.restTimers,
          [exerciseId]: {
            startedAt: Date.now(),
            duration,
          },
        },
      };
    });
  }, []);

  const stopRestTimer = useCallback((exerciseId) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      if (!prev.restTimers[exerciseId]) {
        return prev;
      }

      const restTimers = { ...prev.restTimers };
      delete restTimers[exerciseId];
      return { ...prev, restTimers };
    });
  }, []);

  const toggleRestTimer = useCallback((exerciseId) => {
    setState((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      const existing = prev.restTimers[exerciseId];
      if (existing) {
        const restTimers = { ...prev.restTimers };
        delete restTimers[exerciseId];
        return { ...prev, restTimers };
      }

      const exercise = prev.workout.find((ex) => ex.id === exerciseId);
      if (!exercise) {
        return prev;
      }

      const duration = getExerciseRestPreset(exercise, prev.globalRestSeconds);
      if (!duration) {
        return prev;
      }

      return {
        ...prev,
        restTimers: {
          ...prev.restTimers,
          [exerciseId]: {
            startedAt: Date.now(),
            duration,
          },
        },
      };
    });
  }, []);

  const getRestRemaining = useCallback(
    (exerciseId) => {
      const timer = state.restTimers[exerciseId];
      if (!timer) {
        return 0;
      }
      const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000);
      const remaining = timer.duration - elapsed;
      return remaining > 0 ? remaining : 0;
    },
    [state.restTimers]
  );

  const getExerciseRest = useCallback(
    (exerciseId) => {
      const exercise = state.workout.find((ex) => ex.id === exerciseId);
      return getExerciseRestPreset(exercise, state.globalRestSeconds);
    },
    [state.workout, state.globalRestSeconds]
  );

  const value = useMemo(
    () => ({
      isActive: state.isActive,
      workout: state.workout,
      startedAt: state.startedAt,
      durationSeconds,
      routineInfo: state.routineInfo,
      globalRestSeconds: state.globalRestSeconds,
      restTimers: state.restTimers,
      startWorkout,
      resetWorkout,
      resetDuration,
      addExercises,
      updateExerciseField,
      addSet,
      removeSet,
      setGlobalRestSeconds,
      setExerciseRest,
      startRestTimer,
      stopRestTimer,
      toggleRestTimer,
      getRestRemaining,
      getExerciseRestPreset: getExerciseRest,
    }),
    [
      state.isActive,
      state.workout,
      state.startedAt,
      state.routineInfo,
      state.globalRestSeconds,
      state.restTimers,
      durationSeconds,
      startWorkout,
      resetWorkout,
      resetDuration,
      addExercises,
      updateExerciseField,
      addSet,
      removeSet,
      setGlobalRestSeconds,
      setExerciseRest,
      startRestTimer,
      stopRestTimer,
      toggleRestTimer,
      getRestRemaining,
      getExerciseRest,
    ]
  );

  return (
    <ActiveWorkoutContext.Provider value={value}>
      {children}
    </ActiveWorkoutContext.Provider>
  );
};

export const useActiveWorkout = () => {
  const context = useContext(ActiveWorkoutContext);
  if (!context) {
    throw new Error(
      "useActiveWorkout must be used within ActiveWorkoutProvider"
    );
  }
  return context;
};
