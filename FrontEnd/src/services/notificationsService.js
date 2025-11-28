// services/notificationsService.js
import api from "./authService";

// Obtener todas las notificaciones del usuario
export const getMyNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      data: [],
      message: error.response?.data?.message || "Error al obtener notificaciones",
    };
  }
};

// Marcar una notificación como leída
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al marcar como leída",
    };
  }
};

// Marcar todas las notificaciones como leídas
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.put("/notifications/read-all");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al marcar todas como leídas",
    };
  }
};

// Eliminar una notificación
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/notifications/${notificationId}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al eliminar notificación",
    };
  }
};

// Obtener contador de notificaciones no leídas
export const getUnreadCount = async () => {
  try {
    const response = await api.get("/notifications");
    const notifications = response.data || [];
    const unreadCount = notifications.filter(n => !n.is_read).length;
    
    return {
      success: true,
      count: unreadCount,
    };
  } catch (error) {
    return {
      success: false,
      count: 0,
    };
  }
};
