import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Search, Send } from "lucide-react";
import { getConversations } from "../../services/messagesService";
import { getUserFollowing } from "../../services/usersService";
import { useMessages } from "../../context/MessagesContext";
import { useAuth } from "../../context/AuthContext";
import "./Messages.css";

const Messages = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { updateUnreadCount } = useMessages();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [followingUsers, setFollowingUsers] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  useEffect(() => {
    const loadConversations = async () => {
      setLoading(true);
      const result = await getConversations();

      if (result.success) {
        setConversations(result.data);
        // Actualizar contador global
        updateUnreadCount();

        // Si no hay conversaciones, cargar usuarios seguidos
        if (result.data.length === 0 && user?.id_user) {
          setLoadingFollowing(true);
          const followingResult = await getUserFollowing(user.id_user);
          if (followingResult.success) {
            setFollowingUsers(followingResult.data || []);
          }
          setLoadingFollowing(false);
        }
      }

      setLoading(false);
    };

    loadConversations();

    // Actualizar conversaciones cada 5 segundos
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []); // Removido updateUnreadCount de las dependencias

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return "";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins === 0 ? "Ahora" : `${diffMins}m`;
    } else if (diffHours < 24) {
      return `${diffHours}h`;
    } else if (diffDays === 1) {
      return "Ayer";
    } else if (diffDays < 7) {
      return `${diffDays}d`;
    } else {
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
  };

  const handleConversationClick = (otherUserId) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/messages/${otherUserId}`);
  };

  return (
    <div className="messages-container">
      <div className="conversations-list">
        <div className="conversations-header">
          <h2 className="conversations-title">
            <MessageCircle size={24} />
            Mensajes
          </h2>
        </div>

        <div className="conversations-search">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Buscar conversación..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="conversations-items">
          {loading ? (
            <div className="empty-state">
              <p>Cargando conversaciones...</p>
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.other_user_id}
                className="conversation-item"
                onClick={() => handleConversationClick(conv.other_user_id)}
              >
                <img
                  src={
                    conv.avatar_url ||
                    `https://ui-avatars.com/api/?name=${conv.full_name}&background=7882b6&color=fff`
                  }
                  alt={conv.full_name}
                  className="conversation-avatar"
                />
                <div className="conversation-info">
                  <div className="conversation-header-row">
                    <span className="conversation-name">{conv.full_name}</span>
                    <span className="conversation-time">
                      {formatTime(conv.last_message_time)}
                    </span>
                  </div>
                  <div className="conversation-last-message">
                    <span
                      className={
                        parseInt(conv.unread_count) > 0 ? "unread" : ""
                      }
                    >
                      {conv.last_message || "Sin mensajes"}
                    </span>
                    {parseInt(conv.unread_count) > 0 && (
                      <span className="unread-badge">{conv.unread_count}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="empty-state">
              <MessageCircle size={48} />
              <p>No hay conversaciones</p>
              {searchQuery.trim() === "" && (
                <>
                  <p className="empty-state-hint">
                    Envía un mensaje a alguien para iniciar una conversación
                  </p>
                  {followingUsers.length > 0 && (
                    <div className="suggested-users">
                      <h3 className="suggested-title">Usuarios que sigues</h3>
                      <div className="suggested-users-list">
                        {followingUsers.slice(0, 6).map((user) => (
                          <button
                            key={user.id_user}
                            className="suggested-user-item"
                            onClick={() =>
                              handleConversationClick(user.id_user)
                            }
                          >
                            <img
                              src={
                                user.avatar_url ||
                                `https://ui-avatars.com/api/?name=${user.full_name}&background=7882b6&color=fff`
                              }
                              alt={user.full_name}
                              className="suggested-user-avatar"
                            />
                            <div className="suggested-user-info">
                              <span className="suggested-user-name">
                                {user.full_name}
                              </span>
                              <span className="suggested-user-username">
                                @{user.username}
                              </span>
                            </div>
                            <Send size={16} className="suggested-user-icon" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
