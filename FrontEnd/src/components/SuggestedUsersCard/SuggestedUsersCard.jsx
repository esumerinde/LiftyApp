import { useState, useEffect } from "react";
import { UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  searchUsers,
  followUser,
  unfollowUser,
} from "../../services/usersService";
import "./SuggestedUsersCard.css";

const SuggestedUsersCard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  // Cargar todos los usuarios desde el backend
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        // Buscar todos los usuarios (query vacía devuelve todos)
        const result = await searchUsers("");

        if (result.success && result.data) {
          // El backend ya devuelve el array directamente con is_following
          setSuggestedUsers(result.data);
        }
      } catch (error) {
        console.error("Error al cargar usuarios:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id_user) {
      loadUsers();
    }
  }, [user]);

  const handleFollowToggle = async (userId) => {
    try {
      setFollowLoading((prev) => ({ ...prev, [userId]: true }));

      // Encontrar el usuario en el estado actual
      const userIndex = suggestedUsers.findIndex((u) => u.id_user === userId);
      if (userIndex === -1) return;

      const isCurrentlyFollowing = suggestedUsers[userIndex].is_following === 1;

      const result = isCurrentlyFollowing
        ? await unfollowUser(userId)
        : await followUser(userId);

      if (result.success) {
        // Actualizar estado local
        setSuggestedUsers((prev) =>
          prev.map((u) =>
            u.id_user === userId
              ? { ...u, is_following: isCurrentlyFollowing ? 0 : 1 }
              : u
          )
        );
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir usuario:", error);
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUserClick = (username) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/profile/${username}`);
  };

  if (loading || suggestedUsers.length === 0) return null;

  return (
    <div className="suggested-users-card lifty-card-static">
      <div className="suggested-header">
        <h3 className="suggested-title">Usuarios Sugeridos</h3>
        <span className="suggested-count">
          {suggestedUsers.length} usuarios
        </span>
      </div>

      <div className="suggested-users-list">
        {suggestedUsers.map((u) => (
          <div
            key={u.id_user}
            className="suggested-user-item lifty-card"
            role="group"
            aria-label={`Usuario sugerido ${u.full_name}`}
          >
            <img
              src={
                u.avatar_url ||
                `https://ui-avatars.com/api/?name=${u.full_name}&background=7882b6&color=fff&size=120`
              }
              alt={u.full_name}
              className="suggested-avatar"
              onClick={() => handleUserClick(u.username)}
            />

            <div className="suggested-info">
              <h4
                className="suggested-name"
                onClick={() => handleUserClick(u.username)}
              >
                {u.full_name}
              </h4>
              <p className="suggested-username">@{u.username}</p>
              <span className="suggested-meta">
                {u.followers_count > 0
                  ? `${u.followers_count} ${
                      u.followers_count === 1 ? "seguidor" : "seguidores"
                    }`
                  : "Sé el primero en seguir"}
              </span>
            </div>

            <button
              type="button"
              className={`suggested-follow-btn lifty-btn-small ${
                u.is_following === 1 ? "following" : "follow"
              }`}
              onClick={() => handleFollowToggle(u.id_user)}
              disabled={followLoading[u.id_user]}
            >
              <UserPlus size={16} strokeWidth={2} />
              <span>{u.is_following === 1 ? "Siguiendo" : "Seguir"}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUsersCard;
