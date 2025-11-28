// services/messagesService.js
import api from "./api";

// Obtener todas las conversaciones
export const getConversations = async () => {
  try {
    const response = await api.get("/messages/conversations");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener conversaciones",
      error: error.response?.data,
    };
  }
};

// Obtener mensajes de un chat específico
export const getChatMessages = async (otherUserId) => {
  try {
    const response = await api.get(`/messages/chat/${otherUserId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener mensajes",
      error: error.response?.data,
    };
  }
};

// Enviar mensaje
export const sendMessage = async (receiverId, content) => {
  try {
    const response = await api.post("/messages/send", {
      receiverId,
      content,
    });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al enviar mensaje",
      error: error.response?.data,
    };
  }
};

// Marcar mensaje como leído
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await api.put(`/messages/${messageId}/read`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al marcar como leído",
      error: error.response?.data,
    };
  }
};

// Obtener info de un chat
export const getChatInfo = async (otherUserId) => {
  try {
    const response = await api.get(`/messages/chat/${otherUserId}/info`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener info del chat",
      error: error.response?.data,
    };
  }
};
