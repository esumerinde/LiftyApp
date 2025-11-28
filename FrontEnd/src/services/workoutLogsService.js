// services/workoutLogsService.js
import api from "./authService";

// Obtener workout logs del usuario
export const getMyWorkoutLogs = async () => {
  try {
    const response = await api.get("/workout-logs/my-logs");
    return {
      success: true,
      data: response.data.logs || response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al obtener entrenamientos",
      error: error.response?.data,
    };
  }
};

// Obtener workout logs de un usuario específico por userId
export const getUserWorkoutLogs = async (userId) => {
  try {
    const response = await api.get(`/workout-logs/user/${userId}`);
    return {
      success: true,
      data: response.data.logs || response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error al obtener entrenamientos del usuario",
      error: error.response?.data,
    };
  }
};

// Obtener feed de entrenamientos (todos los públicos para HUB)
export const getWorkoutFeed = async () => {
  try {
    const response = await api.get("/workout-logs/feed");
    return {
      success: true,
      data: response.data.logs || response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener feed",
      error: error.response?.data,
    };
  }
};

// Obtener entrenamientos de usuarios seguidos
export const getFollowingWorkouts = async () => {
  try {
    const response = await api.get("/workout-logs/following");
    console.log("📡 getFollowingWorkouts - Response completa:", response.data);
    return {
      success: true,
      data: response.data.logs || response.data, // Extraer logs directamente
    };
  } catch (error) {
    console.error("❌ getFollowingWorkouts - Error:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error al obtener entrenamientos de seguidos",
      error: error.response?.data,
    };
  }
};

// Crear workout log
export const createWorkoutLog = async (logData) => {
  try {
    const response = await api.post("/workout-logs", logData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al crear entrenamiento",
      error: error.response?.data,
    };
  }
};

// Obtener workout log por ID
export const getWorkoutLogById = async (id) => {
  try {
    const response = await api.get(`/workout-logs/${id}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Error al obtener entrenamiento",
      error: error.response?.data,
    };
  }
};

// Dar like a un workout
export const likeWorkout = async (logId) => {
  try {
    const response = await api.post(`/workout-logs/${logId}/like`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al dar like",
      error: error.response?.data,
    };
  }
};

// Agregar comentario a workout
export const addComment = async (logId, content) => {
  try {
    const response = await api.post(`/workout-logs/${logId}/comments`, {
      content,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al comentar",
      error: error.response?.data,
    };
  }
};

// Obtener comentarios de un workout
export const getComments = async (logId) => {
  try {
    const response = await api.get(`/workout-logs/${logId}/comments`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener comentarios",
      error: error.response?.data,
    };
  }
};

// Eliminar comentario
export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/workout-logs/comments/${commentId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al eliminar comentario",
      error: error.response?.data,
    };
  }
};

// Obtener ejercicios de un workout log
export const getWorkoutLogExercises = async (logId) => {
  try {
    const response = await api.get(`/workout-logs/${logId}/exercises`);
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

// Obtener usuarios que dieron like a un workout
export const getWorkoutLikes = async (logId) => {
  try {
    const response = await api.get(`/workout-logs/${logId}/likes`);
    // Backend devuelve { success: true, likes: [...] }
    return {
      success: true,
      data: {
        likes: response.data.likes || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener likes",
      error: error.response?.data,
    };
  }
};
