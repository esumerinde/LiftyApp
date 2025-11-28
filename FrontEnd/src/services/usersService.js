// services/usersService.js
import api from "./api";

// Buscar usuario por username
export const getUserByUsername = async (username) => {
  try {
    const response = await api.get(`/username/${username}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Usuario no encontrado",
      error: error.response?.data,
    };
  }
};

// Obtener perfil público de un usuario por ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/${userId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Usuario no encontrado",
      error: error.response?.data,
    };
  }
};

// Buscar usuarios (para autocompletado)
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/search?q=${query}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al buscar usuarios",
      error: error.response?.data,
    };
  }
};

// Seguir a un usuario
export const followUser = async (userId) => {
  try {
    const response = await api.post(`/${userId}/follow`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al seguir usuario",
      error: error.response?.data,
    };
  }
};

// Dejar de seguir a un usuario
export const unfollowUser = async (userId) => {
  try {
    const response = await api.delete(`/${userId}/follow`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al dejar de seguir",
      error: error.response?.data,
    };
  }
};

// Verificar si sigo a un usuario
export const checkFollowStatus = async (userId) => {
  try {
    const response = await api.get(`/${userId}/follow-status`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al verificar estado",
      error: error.response?.data,
    };
  }
};

// Obtener seguidores de un usuario
export const getUserFollowers = async (userId) => {
  try {
    const response = await api.get(`/${userId}/followers`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener seguidores",
      error: error.response?.data,
    };
  }
};

// Obtener usuarios seguidos por un usuario
export const getUserFollowing = async (userId) => {
  try {
    const response = await api.get(`/${userId}/following`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener seguidos",
      error: error.response?.data,
    };
  }
};

// Obtener estadísticas de usuario
export const getUserStats = async (userId, type = "duration") => {
  try {
    const response = await api.get(`/${userId}/stats?type=${type}`);
    return {
      success: true,
      data: response.data.data,
      type: response.data.type,
      period: response.data.period,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener estadísticas",
      error: error.response?.data,
    };
  }
};

// Obtener usuarios por rol (trainer, nutritionist)
export const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/role/${role}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || `Error al obtener ${role}s`,
      error: error.response?.data,
    };
  }
};
