// services/dailyGoalsService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserDailyGoals = async () => {
  try {
    const response = await axios.get(`${API_URL}/daily-goals`, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al obtener metas diarias:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updateUserDailyGoals = async (goals) => {
  try {
    const response = await axios.put(`${API_URL}/daily-goals`, goals, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error al actualizar metas diarias:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const addWater = async (liters) => {
  try {
    const response = await axios.post(`${API_URL}/daily-goals/water`, 
      { liters },
      { 
        headers: getAuthHeader(),
        withCredentials: true, // Para enviar cookies
      }
    );
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al agregar agua:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const resetWater = async () => {
  try {
    const response = await axios.delete(`${API_URL}/daily-goals/water`, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error al resetear agua:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const getDailyGoalsByDate = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/daily-goals/by-date`, {
      params: { date },
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al obtener historial de metas:", error);
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const saveDailySnapshot = async () => {
  try {
    const response = await axios.post(`${API_URL}/daily-goals/snapshot`, {}, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error al guardar snapshot:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
