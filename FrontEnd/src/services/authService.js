// services/authService.js
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Para enviar cookies si es necesario
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    // Solo agregar header si existe token en localStorage
    // Si no existe, el backend usará la cookie automáticamente
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // withCredentials ya está configurado para enviar cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Opcional: redirigir al login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ========== SERVICIOS DE AUTENTICACIÓN ==========

// Solicitar código de verificación
export const requestVerificationCode = async (email) => {
  try {
    const response = await api.post("/verification/request", { email });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Error al enviar el código de verificación",
      error: error.response?.data,
    };
  }
};

// Verificar código de email
export const verifyCode = async (email, code) => {
  try {
    const response = await api.post("/verification/verify", { email, code });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al verificar el código",
      error: error.response?.data,
    };
  }
};

// Registro de usuario
export const register = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);

    // Guardar token y usuario en localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al registrar el usuario",
      error: error.response?.data,
    };
  }
};

// Login de usuario
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });

    // Guardar token y usuario en localStorage
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al iniciar sesión",
      error: error.response?.data,
    };
  }
};

// Logout
export const logout = async () => {
  try {
    await api.post("/auth/logout");

    // Limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return {
      success: true,
    };
  } catch (error) {
    // Aunque falle, limpiar localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return {
      success: false,
      message: error.response?.data?.message || "Error al cerrar sesión",
    };
  }
};

// Obtener perfil del usuario actual
export const getProfile = async () => {
  try {
    const response = await api.get("/auth/profile");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el perfil",
      error: error.response?.data,
    };
  }
};

// Obtener usuario actual
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Error al obtener el usuario",
      error: error.response?.data,
    };
  }
};

// Verificar si el usuario está autenticado
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Obtener usuario desde localStorage
export const getStoredUser = () => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing stored user:", error);
      return null;
    }
  }
  return null;
};

// Verificar disponibilidad de email
export const checkEmailAvailability = async (email) => {
  try {
    const response = await api.get(
      `/auth/check-email?email=${encodeURIComponent(email)}`
    );
    return {
      success: true,
      available: response.data.available,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      available: false,
      message: error.response?.data?.message || "Error al verificar email",
    };
  }
};

// Verificar disponibilidad de username
export const checkUsernameAvailability = async (username) => {
  try {
    const response = await api.get(
      `/auth/check-username?username=${encodeURIComponent(username)}`
    );
    return {
      success: true,
      available: response.data.available,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      available: false,
      message: error.response?.data?.message || "Error al verificar username",
    };
  }
};

// Exportar la instancia de axios por si se necesita usar directamente
export default api;
