import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ChevronDown,
  LogIn,
  UserCircle,
  Utensils,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";
import { logout as logoutService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./UserNav.css";

const UserNav = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, clearAuth } = useAuth();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (path) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setIsOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    console.log("Cerrando sesión...");

    // Llamar al backend para limpiar la cookie
    await logoutService();

    // Limpiar estado global de autenticación
    clearAuth();

    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/login");
  };

  const handleLogin = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/login");
  };

  return (
    <div className="user-nav">
      {!isAuthenticated ? (
        // Estado: NO loggeado
        <button
          className="lifty-btn-primary user-nav-login-btn"
          onClick={handleLogin}
        >
          <LogIn size={20} strokeWidth={2} />
          <span>Iniciar Sesión</span>
        </button>
      ) : (
        // Estado: Loggeado
        <div className="user-nav-dropdown">
          <button
            className="user-nav-trigger"
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label="Menú de usuario"
          >
            <img
              src={
                user?.avatar_url ||
                `https://ui-avatars.com/api/?name=${
                  user?.full_name || user?.username || "User"
                }&background=6366f1&color=fff`
              }
              alt={user?.full_name || user?.username}
              className="user-nav-avatar"
            />
            <span className="user-nav-name">
              {user?.full_name || user?.username}
            </span>
            <ChevronDown
              className={`user-nav-chevron ${isOpen ? "open" : ""}`}
              size={18}
              strokeWidth={2}
            />
          </button>

          {isOpen && (
            <>
              <div
                className="user-nav-backdrop"
                onClick={() => setIsOpen(false)}
              />
              <div className="user-nav-menu">
                {/* Info del usuario */}
                <div className="user-nav-header">
                  <img
                    src={
                      user?.avatar_url ||
                      `https://ui-avatars.com/api/?name=${
                        user?.full_name || user?.username || "User"
                      }&background=6366f1&color=fff`
                    }
                    alt={user?.full_name || user?.username}
                    className="user-nav-menu-avatar"
                  />
                  <div className="user-nav-info">
                    <p className="user-nav-menu-name">
                      {user?.full_name || user?.username}
                    </p>
                    <p className="user-nav-menu-email">{user?.email}</p>
                  </div>
                </div>

                <div className="user-nav-divider" />

                {/* Opciones del menú */}
                <div className="user-nav-options">
                  <button
                    className="user-nav-option"
                    onClick={() => handleNavigate("/profile")}
                  >
                    <UserCircle size={20} strokeWidth={2} />
                    <span>Mi Cuenta</span>
                  </button>

                  <button
                    className="user-nav-option"
                    onClick={() => handleNavigate("/my-saved-routines")}
                  >
                    <ClipboardList size={20} strokeWidth={2} />
                    <span>Mis Rutinas</span>
                  </button>

                  <button
                    className="user-nav-option"
                    onClick={() => handleNavigate("/diets")}
                  >
                    <Utensils size={20} strokeWidth={2} />
                    <span>Mis Dietas</span>
                  </button>

                  <button
                    className="user-nav-option"
                    onClick={() => handleNavigate("/profile")}
                  >
                    <Settings size={20} strokeWidth={2} />
                    <span>Configuración</span>
                  </button>
                </div>

                <div className="user-nav-divider" />

                {/* Cerrar sesión */}
                <button
                  className="user-nav-option logout"
                  onClick={handleLogout}
                >
                  <LogOut size={20} strokeWidth={2} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserNav;
