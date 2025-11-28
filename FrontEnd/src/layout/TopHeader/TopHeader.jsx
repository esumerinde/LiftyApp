import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, MessageCircle, X } from "lucide-react";
import Sidebar from "../Sidebar/Sidebar";
import UserNav from "../UserNav/UserNav";
import NotificationBell from "../../components/NotificationBell/NotificationBell";
import { useMessages } from "../../context/MessagesContext";
import "./TopHeader.css";
import LogoFull from "../../assets/Logo/LogoLiftyFull.png";

const TopHeader = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useMessages();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMessagesClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/messages");
  };

  return (
    <>
      <header className="top-header">
        <div className="top-header-container">
          {/* Botón Hamburguesa */}
          <button
            className="hamburger-btn"
            onClick={toggleSidebar}
            aria-label="Menú"
          >
            <Menu size={24} strokeWidth={2} />
          </button>

          {/* Logo/Título */}
          <div className="header-logo">
            <img src={LogoFull} alt="LiftyApp" className="header-logo-img" />
          </div>

          {/* Acciones Derecha */}
          <div className="top-header-right">
            <button
              className="header-icon-btn"
              aria-label="Mensajes"
              onClick={handleMessagesClick}
            >
              <MessageCircle size={22} strokeWidth={2} />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Sidebar deslizable */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar} />
      )}
    </>
  );
};

export default TopHeader;
