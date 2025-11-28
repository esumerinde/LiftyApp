import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  X,
  Home,
  ClipboardList,
  Dumbbell,
  Utensils,
  Apple,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Compass,
  Crown,
  Search,
} from "lucide-react";
import { logout as logoutService } from "../../services/authService";
import { getUserByUsername } from "../../services/usersService";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";
import LogoLarge from "../../assets/Logo/LogoLiftyLarge.png";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, clearAuth } = useAuth();
  const [searchUsername, setSearchUsername] = useState("");
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const menuItems = [
    { id: "feed", label: "Inicio", icon: Home, path: "/" },
    {
      id: "explore",
      label: "Explorar",
      icon: Compass,
      path: "/explore",
    },
    {
      id: "routines",
      label: "Mis Rutinas",
      icon: ClipboardList,
      path: "/routines",
    },
    {
      id: "exercises",
      label: "Ejercicios",
      icon: Dumbbell,
      path: "/all-exercises",
    },
    { id: "diets", label: "Mis Dietas", icon: Utensils, path: "/meals" },
    { id: "profile", label: "Mi Perfil", icon: User, path: "/profile" },
    {
      id: "premium",
      label: user?.isPremium ? "Mi Suscripción" : "Premium",
      icon: Crown,
      path: user?.isPremium ? "/subscription" : "/premium",
    },
  ];

  const handleMenuClick = (path) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Si el usuario no está autenticado, redirigir a login
    if (!isAuthenticated) {
      navigate("/login");
      onClose();
      return;
    }

    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    console.log("Cerrando sesión...");

    // Llamar al backend para limpiar la cookie
    await logoutService();

    // Limpiar estado global de autenticación
    clearAuth();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/login");
    onClose();
  };

  const handleLogin = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/login");
    onClose();
  };

  const handleRegister = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/register");
    onClose();
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    const username = searchUsername.trim();

    if (!username) {
      setSearchError("Ingresa un nombre de usuario");
      return;
    }

    // Verificar que no se busque a sí mismo
    if (user && username.toLowerCase() === user.username.toLowerCase()) {
      setSearchError("No puedes buscarte a ti mismo");
      setSearchUsername("");
      return;
    }

    setIsSearching(true);
    setSearchError("");

    // Buscar usuario en el backend
    const result = await getUserByUsername(username);

    setIsSearching(false);

    if (result.success) {
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate(`/profile/${username}`);
      setSearchUsername("");
      setSearchError("");
      onClose();
    } else {
      setSearchError(result.message || "Usuario no encontrado");
    }
  };

  // Si el usuario NO está loggeado, mostrar botones de auth
  if (!isAuthenticated) {
    return (
      <>
        {/* Backdrop */}
        {isOpen && (
          <div
            className="sidebar-backdrop"
            onClick={onClose}
            aria-hidden="true"
          />
        )}

        {/* Sidebar NO autenticado */}
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
          <div className="sidebar-content">
            {/* Header del Sidebar */}
            <div className="sidebar-header">
              <div className="sidebar-logo">
                <img
                  src={LogoLarge}
                  alt="LiftyApp"
                  className="sidebar-logo-img"
                />
              </div>
              <button
                className="sidebar-close-btn"
                onClick={onClose}
                aria-label="Cerrar menú"
              >
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {/* Mensaje para usuarios no autenticados */}
            <div className="sidebar-auth-message">
              <Dumbbell size={48} className="sidebar-auth-icon" />
              <h3>Bienvenido a LiftyApp</h3>
              <p>Inicia sesión para acceder a todas las funciones</p>
            </div>

            {/* Botones de Autenticación */}
            <div className="sidebar-auth-buttons">
              <button className="lifty-btn-primary" onClick={handleLogin}>
                <LogIn size={20} />
                Iniciar Sesión
              </button>
              <button className="lifty-btn-secondary" onClick={handleRegister}>
                <UserPlus size={20} />
                Crear Cuenta
              </button>
            </div>
          </div>
        </aside>
      </>
    );
  }

  // Si está loggeado, mostrar menú completo

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          {/* Header del Sidebar */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <img
                src={LogoLarge}
                alt="LiftyApp"
                className="sidebar-logo-img"
              />
            </div>
            <button
              className="sidebar-close-btn"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <X size={24} strokeWidth={2} />
            </button>
          </div>

          {/* Search Bar */}
          <form className="sidebar-search" onSubmit={handleSearchUser}>
            <Search size={18} className="sidebar-search-icon" />
            <input
              type="text"
              placeholder={isSearching ? "Buscando..." : "Buscar usuarios"}
              className={`sidebar-search-input ${searchError ? "error" : ""}`}
              value={searchUsername}
              onChange={(e) => {
                setSearchUsername(e.target.value);
                if (searchError) setSearchError("");
              }}
              disabled={isSearching}
            />
            {searchError && (
              <span className="sidebar-search-error">{searchError}</span>
            )}
          </form>

          {/* Menu Items */}
          <nav className="sidebar-nav">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.id}
                  className={`sidebar-nav-item ${isActive ? "active" : ""}`}
                  onClick={() => handleMenuClick(item.path)}
                >
                  <IconComponent
                    className="nav-item-icon"
                    size={20}
                    strokeWidth={2}
                  />
                  <span className="nav-item-label">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Spacer para empujar el footer al fondo */}
          <div className="sidebar-spacer" />

          {/* Footer con Usuario y Logout */}
          <div className="sidebar-footer">
            <div className="sidebar-user">
              <img
                src={
                  user?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${user?.full_name}&background=7882b6&color=fff`
                }
                alt={user?.full_name}
                className="sidebar-user-avatar"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate("/profile");
                  onClose();
                }}
                style={{ cursor: "pointer" }}
              />
              <div
                className="sidebar-user-info"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "instant" });
                  navigate("/profile");
                  onClose();
                }}
                style={{ cursor: "pointer" }}
              >
                <span className="sidebar-user-name">{user?.username}</span>
              </div>
              <button
                className="sidebar-logout-btn"
                onClick={handleLogout}
                aria-label="Cerrar sesión"
              >
                <LogOut size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
