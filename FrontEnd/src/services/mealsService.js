// services/mealsService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserMeals = async () => {
  try {
    const response = await axios.get(`${API_URL}/meals`, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al obtener comidas:", error);
    return {
      success: false,
      data: [],
      error: error.response?.data?.message || error.message,
    };
  }
};

export const createMeal = async (mealData) => {
  try {
    const response = await axios.post(`${API_URL}/meals`, mealData, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al crear comida:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const updateMeal = async (id, mealData) => {
  try {
    const response = await axios.put(`${API_URL}/meals/${id}`, mealData, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error al actualizar comida:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export const deleteMeal = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/meals/${id}`, {
      headers: getAuthHeader(),
      withCredentials: true, // Para enviar cookies
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    console.error("Error al eliminar comida:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};
