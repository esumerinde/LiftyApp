// services/routinesService.js
import api from "./authService";

// Obtener todas las rutinas del usuario
export const getMyRoutines = async () => {
  try {
    const response = await api.get("/my-routines");
    
    // El backend ahora devuelve {success: true, data: [...]}
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data || [],
      };
    }
    
    // Fallback por si devuelve array directamente
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Error al obtener rutinas",
      error: error.response?.data,
    };
  }
};

// Obtener rutina por ID
export const getRoutineById = async (id) => {
  try {
    const response = await api.get(`/routines/${id}`);
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data,
      };
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener rutina",
      error: error.response?.data,
    };
  }
};

// Crear nueva rutina
export const createRoutine = async (routineData) => {
  try {
    const response = await api.post("/routines", routineData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al crear rutina",
      error: error.response?.data,
    };
  }
};

// Actualizar rutina
export const updateRoutine = async (id, routineData) => {
  try {
    const response = await api.put(`/routines/${id}`, routineData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al actualizar rutina",
      error: error.response?.data,
    };
  }
};

// Eliminar rutina
export const deleteRoutine = async (id) => {
  try {
    const response = await api.delete(`/routines/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al eliminar rutina",
      error: error.response?.data,
    };
  }
};

// Obtener rutinas destacadas
export const getFeaturedRoutines = async () => {
  try {
    const response = await api.get("/routines/featured");
    
    // El backend devuelve {success: true, data: {trending: [], popular: [], ...}}
    if (response.data?.success) {
      return {
        success: true,
        data: response.data.data || {
          trending: [],
          popular: [],
          trainers: [],
          recommended: [],
        },
      };
    }
    
    // Fallback por si devuelve el objeto directamente
    return {
      success: true,
      data: response.data || {
        trending: [],
        popular: [],
        trainers: [],
        recommended: [],
      },
    };
  } catch (error) {
    return {
      success: false,
      data: {
        trending: [],
        popular: [],
        trainers: [],
        recommended: [],
      },
      message:
        error.response?.data?.message || "Error al obtener rutinas destacadas",
      error: error.response?.data,
    };
  }
};

// Obtener rutinas por sección (trending, popular, trainers, recommended)
export const getRoutinesBySection = async (section) => {
  try {
    const response = await api.get(`/routines/featured/${section}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener rutinas",
      error: error.response?.data,
    };
  }
};

export const getSavedRoutines = async () => {
  try {
    const response = await api.get("/saved-routines");
    return {
      success: true,
      data: response.data?.data || response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al obtener rutinas guardadas",
      error: error.response?.data,
    };
  }
};

export const saveRoutineForUser = async (routineId) => {
  try {
    const response = await api.post(`/routines/${routineId}/save`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al guardar la rutina",
      error: error.response?.data,
    };
  }
};

export const unsaveRoutineForUser = async (routineId) => {
  try {
    const response = await api.delete(`/routines/${routineId}/save`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al eliminar la rutina",
      error: error.response?.data,
    };
  }
};

/**
 * Genera una rutina personalizada con IA para el usuario autenticado
 */
export const generateAIRoutine = async () => {
  try {
    const response = await api.post("/routines/generate");
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error generando rutina con IA:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error al generar rutina",
      error: error.response?.data,
    };
  }
};
