// services/profileService.js
import api from "./authService";

// Obtener perfil del usuario autenticado
export const getMyProfile = async () => {
  try {
    const response = await api.get("/profile");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener perfil",
      error: error.response?.data,
    };
  }
};

// Actualizar perfil del usuario autenticado
export const updateMyProfile = async (profileData) => {
  try {
    const response = await api.put("/profile", profileData);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al actualizar perfil",
      error: error.response?.data,
    };
  }
};

// Verificar disponibilidad de username
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await api.get(`/profile/check-username?username=${username}`);
    return {
      success: true,
      available: response.data.available,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al verificar username",
    };
  }
};
