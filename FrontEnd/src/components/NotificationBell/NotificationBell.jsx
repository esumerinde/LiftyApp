import { useState, useEffect } from "react";
import { Bell, X, CheckCheck, Trash2, Dumbbell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../../services/notificationsService";
import "./NotificationBell.css";

const NotificationBell = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = await getMyNotifications();
      console.log('Notificaciones cargadas:', result);
      
      if (result.success) {
        setNotifications(result.data);
        const unread = result.data.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
        console.log('Total:', result.data.length, 'No leídas:', unread);
      } else {
        console.error('Error al cargar notificaciones:', result.message);
      }
    } catch (error) {
      console.error('Error en loadNotifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    console.log('Bell clicked, current state:', showDropdown);
    setShowDropdown(!showDropdown);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    await loadNotifications();
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
    await loadNotifications();
  };

  const handleNotificationClick = async (notification) => {
    // Marcar como leída
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id_notification);
    }

    // Navegar según el tipo
    if (notification.type === "new_routine" && notification.related_id) {
      setShowDropdown(false);
      navigate(`/routine/${notification.related_id}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "new_routine":
        return <Dumbbell size={18} strokeWidth={2} />;
      default:
        return <Bell size={18} strokeWidth={2} />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString();
  };

  return (
    <div className="notification-bell-container">
      <button
        type="button"
        className="notification-bell-btn"
        onClick={handleBellClick}
        aria-label="Notificaciones"
      >
        <Bell size={22} strokeWidth={2} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <>
          <div
            className="notification-backdrop"
            onClick={() => setShowDropdown(false)}
          />
          <div className="notification-dropdown">
            <div className="notification-header">
              <h3>Notificaciones</h3>
              <div className="notification-header-actions">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck size={18} strokeWidth={2} />
                  </button>
                )}
                <button
                  type="button"
                  className="close-dropdown-btn"
                  onClick={() => setShowDropdown(false)}
                  aria-label="Cerrar"
                >
                  <X size={20} strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">Cargando...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={48} strokeWidth={1.5} />
                  <p>No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id_notification}
                    className={`notification-item ${
                      !notification.is_read ? "unread" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-title">
                        {notification.title}
                      </div>
                      <div className="notification-message">
                        {notification.message}
                      </div>
                      <div className="notification-time">
                        {formatTime(notification.created_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="notification-delete-btn"
                      onClick={(e) =>
                        handleDelete(notification.id_notification, e)
                      }
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
