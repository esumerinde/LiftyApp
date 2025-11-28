import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const addConsumedMeal = async (id_meal) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/api/consumed-meals`,
      { id_meal },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Para enviar cookies
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al agregar comida consumida:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error al agregar comida",
    };
  }
};

export const getTodayConsumedMeals = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/consumed-meals/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true, // Para enviar cookies
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener comidas consumidas:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error al obtener comidas",
    };
  }
};

export const deleteConsumedMeal = async (id_consumed) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.delete(
      `${API_URL}/api/consumed-meals/${id_consumed}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true, // Para enviar cookies
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al eliminar comida consumida:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error al eliminar comida",
    };
  }
};

export const getConsumedMealsByDate = async (date) => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/api/consumed-meals/by-date`, {
      params: { date },
      headers: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true, // Para enviar cookies
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener comidas por fecha:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Error al obtener comidas",
    };
  }
};
