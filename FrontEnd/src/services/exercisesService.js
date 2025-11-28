// services/exercisesService.js
import api from "./authService";

// Obtener todos los ejercicios
export const getAllExercises = async () => {
  try {
    const response = await api.get("/exercises");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener ejercicios",
      error: error.response?.data,
    };
  }
};

// Obtener ejercicio por ID
export const getExerciseById = async (id) => {
  try {
    const response = await api.get(`/exercises/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener ejercicio",
      error: error.response?.data,
    };
  }
};

// Obtener grupos musculares
export const getMuscleGroups = async () => {
  try {
    const response = await api.get("/exercises/muscle-groups");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener grupos musculares",
      error: error.response?.data,
    };
  }
};

// Obtener ejercicios por grupo muscular
export const getExercisesByMuscleGroup = async (muscleGroupId) => {
  try {
    const response = await api.get(`/exercises/muscle-group/${muscleGroupId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener ejercicios",
      error: error.response?.data,
    };
  }
};
