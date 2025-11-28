import { useLocation, useNavigate } from "react-router-dom";
import { Home, ClipboardList, Compass, Apple, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import "./BottomNav.css";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { id: "home", label: "Inicio", path: "/", icon: Home, requiresAuth: false },
    {
      id: "routines",
      label: "Rutinas",
      path: "/routines",
      icon: ClipboardList,
      requiresAuth: true,
    },
    {
      id: "explore",
      label: "Explorar",
      path: "/explore",
      icon: Compass,
      isMain: true,
      requiresAuth: false,
    },
    {
      id: "meals",
      label: "Comidas",
      path: "/meals",
      icon: Apple,
      requiresAuth: true,
    },
    {
      id: "profile",
      label: "Perfil",
      path: "/profile",
      icon: User,
      requiresAuth: true,
    },
  ];

  const handleNavigation = (path, requiresAuth = false) => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "instant" });

    // Si la ruta requiere autenticación y el usuario no está logeado
    if (requiresAuth && !isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate(path);
  };

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          if (item.isMain) {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className="bottom-nav-main-btn"
                onClick={() => handleNavigation(item.path, item.requiresAuth)}
                aria-label={item.label}
              >
                <IconComponent
                  className="bottom-nav-main-icon"
                  size={28}
                  strokeWidth={2}
                />
              </button>
            );
          }

          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              onClick={() => handleNavigation(item.path, item.requiresAuth)}
              aria-label={item.label}
            >
              <IconComponent
                className="bottom-nav-icon"
                size={24}
                strokeWidth={2}
              />
              <span className="bottom-nav-label">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
