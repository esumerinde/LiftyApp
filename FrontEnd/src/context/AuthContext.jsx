import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Función para verificar autenticación
  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      // Intentar obtener usuario desde el backend (valida el token en la cookie)
      const result = await getCurrentUser();
      
      if (result.success && result.data?.user) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        // Sincronizar con localStorage
        localStorage.setItem("user", JSON.stringify(result.data.user));
      } else {
        // Si falla, limpiar todo
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Error al verificar autenticación:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar autenticación al montar el componente
  useEffect(() => {
    checkAuth();
  }, []);

  // Función para actualizar usuario (llamar después de login/register)
  const updateUser = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const clearAuth = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    updateUser,
    clearAuth,
  };

  // Mostrar un loader mientras se verifica la autenticación inicial
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--lifty-bg-main)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--lifty-border)',
          borderTop: '3px solid var(--lifty-accent-main)',
          borderRadius: '50%',
          animation: 'lifty-spin 0.8s linear infinite'
        }}></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
