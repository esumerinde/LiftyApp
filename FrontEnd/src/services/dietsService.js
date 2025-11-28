// services/dietsService.js
import api from "./api";

const API_URL = "/diets";

// Obtener todas las dietas del usuario
export const getUserDiets = async () => {
  try {
    const response = await api.get(API_URL);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al obtener dietas:", error);
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || error.message,
    };
  }
};

// Obtener una dieta por ID
export const getDietById = async (id) => {
  try {
    const response = await api.get(`${API_URL}/${id}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error al obtener dieta:", error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Crear una nueva dieta
export const createDiet = async (dietData) => {
  try {
    const response = await api.post(API_URL, dietData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al crear dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Actualizar una dieta
export const updateDiet = async (id, dietData) => {
  try {
    const response = await api.put(`${API_URL}/${id}`, dietData);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al actualizar dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Eliminar una dieta
export const deleteDiet = async (id) => {
  try {
    const response = await api.delete(`${API_URL}/${id}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al eliminar dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Agregar comida a una dieta
export const addMealToDiet = async (dietId, mealId, mealOrder = 0) => {
  try {
    const response = await api.post(`${API_URL}/${dietId}/meals`, {
      id_meal: mealId,
      meal_order: mealOrder,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al agregar comida a dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Eliminar comida de una dieta
export const removeMealFromDiet = async (dietId, mealId) => {
  try {
    const response = await api.delete(`${API_URL}/${dietId}/meals/${mealId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al eliminar comida de dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

// Activar dieta (aplicar sus metas a daily_goals)
export const activateDiet = async (dietId) => {
  try {
    const response = await api.post(`${API_URL}/${dietId}/activate`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error al activar dieta:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};
