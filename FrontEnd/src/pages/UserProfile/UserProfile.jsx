import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus, UserMinus, MessageCircle } from "lucide-react";
import WorkoutCard from "../../components/WorkoutCard/WorkoutCard";
import { useAuth } from "../../context/AuthContext";
import {
  getUserByUsername,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
} from "../../services/usersService";
import { getUserWorkoutLogs } from "../../services/workoutLogsService";
import "./UserProfile.css";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [avatarError, setAvatarError] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [userWorkouts, setUserWorkouts] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingFollowAction, setLoadingFollowAction] = useState({});

  const getTimeAgo = (dateString) => {
    if (!dateString) return "hace un momento";

    const now = new Date();
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "hace un momento";

    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "hace un momento";
    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
  };

  const formatWorkoutData = (log) => {
    if (!log) return null;

    const timeReference = log.end_time || log.log_date || log.created_at;
    const timeAgo = getTimeAgo(timeReference);

    let latestComment = null;
    if (log.latest_comment_id && log.latest_comment_content) {
      latestComment = {
        id: log.latest_comment_id,
        username: log.latest_comment_username,
        content: log.latest_comment_content,
        avatar_url: log.latest_comment_avatar_url,
        timeAgo: getTimeAgo(log.latest_comment_created_at),
      };
    }

    return {
      id: log.id_log,
      user: {
        id: log.id_user,
        name: log.full_name || log.username,
        username: log.username,
        avatar: log.avatar_url || "https://i.pravatar.cc/150?img=12",
      },
      title: log.title || log.routine_name || "Entrenamiento",
      timeAgo,
      duration: `${log.duration_minutes || 0}min`,
      volume: `${log.total_weight_kg || 0}kg`,
      totalReps: log.total_reps || 0,
      image: log.image_url,
      exercises: [],
      likes: log.likes_count || 0,
      comments: log.comments_count || 0,
      latestComment,
      isOwnWorkout: currentUser?.id_user === log.id_user,
      isFollowing: log.is_following === 1,
      liked: log.user_liked === 1,
    };
  };

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    setLoading(true);

    const result = await getUserByUsername(username);

    if (result.success && result.data) {
      setProfileUser(result.data);
      setIsFollowing(
        result.data.is_following === 1 || result.data.is_following === true
      );

      // Cargar entrenamientos del usuario
      const workoutsResult = await getUserWorkoutLogs(result.data.id_user);
      if (workoutsResult.success) {
        const formattedWorkouts = (workoutsResult.data || [])
          .map(formatWorkoutData)
          .filter(Boolean);
        setUserWorkouts(formattedWorkouts);
      }
    }

    setLoading(false);
  };

  const handleFollowToggle = async () => {
    if (!profileUser?.id_user || followLoading) return;

    setFollowLoading(true);

    const result = isFollowing
      ? await unfollowUser(profileUser.id_user)
      : await followUser(profileUser.id_user);

    setFollowLoading(false);

    if (result.success) {
      setIsFollowing(!isFollowing);
      setProfileUser((prev) => ({
        ...prev,
        followers_count: isFollowing
          ? (prev.followers_count || 0) - 1
          : (prev.followers_count || 0) + 1,
      }));
    }
  };

  const handleFollowersClick = async () => {
    if (!profileUser?.id_user) return;
    setShowFollowersModal(true);
    setLoadingFollowers(true);
    try {
      const [followersResult, myFollowingResult] = await Promise.all([
        getUserFollowers(profileUser.id_user),
        getUserFollowing(currentUser.id_user),
      ]);

      if (followersResult.success) {
        setFollowersList(followersResult.data || []);
      }

      if (myFollowingResult.success) {
        setFollowingUsers(
          new Set((myFollowingResult.data || []).map((u) => u.id_user))
        );
      }
    } catch (error) {
      console.error("Error loading followers:", error);
      setFollowersList([]);
    } finally {
      setLoadingFollowers(false);
    }
  };

  const handleFollowingClick = async () => {
    if (!profileUser?.id_user) return;
    setShowFollowingModal(true);
    setLoadingFollowing(true);
    try {
      const [followingResult, myFollowingResult] = await Promise.all([
        getUserFollowing(profileUser.id_user),
        getUserFollowing(currentUser.id_user),
      ]);

      if (followingResult.success) {
        setFollowingList(followingResult.data || []);
      }

      if (myFollowingResult.success) {
        setFollowingUsers(
          new Set((myFollowingResult.data || []).map((u) => u.id_user))
        );
      }
    } catch (error) {
      console.error("Error loading following:", error);
      setFollowingList([]);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleFollowToggleInModal = async (userId, isFollowingUser) => {
    setLoadingFollowAction((prev) => ({ ...prev, [userId]: true }));

    try {
      const result = isFollowingUser
        ? await unfollowUser(userId)
        : await followUser(userId);

      if (result.success) {
        setFollowingUsers((prev) => {
          const newSet = new Set(prev);
          if (isFollowingUser) {
            newSet.delete(userId);
          } else {
            newSet.add(userId);
          }
          return newSet;
        });

        if (showFollowingModal && isFollowingUser) {
          setFollowingList((prev) => prev.filter((u) => u.id_user !== userId));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollowAction((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleUserClick = (clickedUsername) => {
    setShowFollowersModal(false);
    setShowFollowingModal(false);

    if (clickedUsername === currentUser?.username) {
      navigate("/profile");
    } else {
      navigate(`/profile/${clickedUsername}`);
    }
  };

  const handleWorkoutsClick = () => {
    document
      .querySelector(".user-workouts-feed")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!profileUser?.id_user) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/messages/${profileUser.id_user}`);
  };

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="loading-container">
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="user-profile-page">
        <div className="error-container">
          <p>Usuario no encontrado</p>
          <button className="lifty-btn-primary" onClick={() => navigate(-1)}>
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-page">
      {/* HERO SECTION */}
      <div className="user-profile-hero">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="user-profile-hero-title">@{profileUser.username}</h1>
      </div>

      {/* INFO USUARIO */}
      <div className="user-profile-info-section">
        <div className="user-profile-header-row">
          <div className="user-profile-avatar-container">
            {profileUser.avatar_url && !avatarError ? (
              <img
                src={profileUser.avatar_url}
                alt="Profile"
                className="user-profile-avatar"
                onError={() => setAvatarError(true)}
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  profileUser.full_name || profileUser.username
                )}&background=7882b6&color=fff&size=256`}
                alt="Profile"
                className="user-profile-avatar"
              />
            )}
          </div>

          <div className="user-profile-stats-container">
            <div
              className="user-profile-stat-item"
              onClick={handleWorkoutsClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {profileUser.workouts_count || 0}
              </span>
              <span className="stat-label">Entrenos</span>
            </div>
            <div
              className="user-profile-stat-item"
              onClick={handleFollowersClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {profileUser.followers_count || 0}
              </span>
              <span className="stat-label">Seguidores</span>
            </div>
            <div
              className="user-profile-stat-item"
              onClick={handleFollowingClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {profileUser.following_count || 0}
              </span>
              <span className="stat-label">Siguiendo</span>
            </div>
          </div>
        </div>

        <div className="user-profile-bio-section">
          <h2 className="user-profile-fullname">{profileUser.full_name}</h2>
          <p className="user-profile-username">@{profileUser.username}</p>
          <p className="user-profile-bio">
            {profileUser.bio || "Este usuario no ha agregado una biografía"}
          </p>
        </div>

        {/* Botón de enviar mensaje */}
        <button
          className="lifty-btn-primary"
          onClick={handleSendMessage}
          style={{
            width: "100%",
            marginTop: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <MessageCircle size={20} />
          <span>Enviar mensaje</span>
        </button>

        {/* Botón de seguir/dejar de seguir */}
        <button
          className={
            isFollowing
              ? "lifty-btn-secondary-dark follow-button"
              : "lifty-btn-primary follow-button"
          }
          onClick={handleFollowToggle}
          disabled={followLoading}
          style={{
            width: "100%",
            marginTop: "12px",
          }}
        >
          {followLoading ? (
            "Cargando..."
          ) : isFollowing ? (
            <>
              <UserMinus size={20} />
              <span>Dejar de seguir</span>
            </>
          ) : (
            <>
              <UserPlus size={20} />
              <span>Seguir</span>
            </>
          )}
        </button>
      </div>

      {/* LISTA DE ENTRENAMIENTOS */}
      <div className="user-workouts-feed">
        <div className="section-header">
          <h3 className="section-label">
            Entrenamientos de {profileUser.username}
          </h3>
          <p className="section-subtitle">
            Entrenamientos y rutinas compartidas
          </p>
        </div>

        <div className="workouts-list">
          {userWorkouts.length > 0 ? (
            userWorkouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                isOwnWorkout={false}
                inProfile={true} // Oculta la parte social (likes, comentarios, compartir)
              />
            ))
          ) : (
            <p className="empty-message">
              Este usuario no ha compartido entrenamientos aún
            </p>
          )}
        </div>
      </div>

      {/* LISTA DE COMIDAS */}
      <div className="user-meals-feed">
        <div className="section-header">
          <h3 className="section-label">Dietas de {profileUser.username}</h3>
          <p className="section-subtitle">
            Plan nutricional y comidas compartidas
          </p>
        </div>
        <p className="empty-message">
          Este usuario no ha compartido dietas aún
        </p>
      </div>

      {/* Modal de Seguidores */}
      {showFollowersModal && (
        <div
          className="likes-modal-overlay"
          onClick={() => setShowFollowersModal(false)}
        >
          <div
            className="likes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="likes-modal-header">
              <h3>Seguidores</h3>
              <button
                className="likes-modal-close"
                onClick={() => setShowFollowersModal(false)}
              >
                ×
              </button>
            </div>
            <div className="likes-modal-body">
              {loadingFollowers ? (
                <p className="likes-modal-empty">Cargando...</p>
              ) : followersList.length > 0 ? (
                followersList.map((follower) => {
                  const isFollowingUser = followingUsers.has(follower.id_user);
                  const isLoadingThisUser =
                    loadingFollowAction[follower.id_user];
                  const isMe = follower.id_user === currentUser?.id_user;

                  return (
                    <div key={follower.id_user} className="likes-modal-user">
                      <img
                        src={
                          follower.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            follower.full_name || follower.username
                          )}&background=7882b6&color=fff&size=256`
                        }
                        alt={follower.username}
                        className="likes-modal-avatar"
                        onClick={() => handleUserClick(follower.username)}
                      />
                      <div className="likes-modal-user-info">
                        <strong
                          className="likes-modal-username"
                          onClick={() => handleUserClick(follower.username)}
                        >
                          {follower.username}
                        </strong>
                        <span className="likes-modal-fullname">
                          {follower.full_name}
                        </span>
                      </div>
                      {!isMe && (
                        <button
                          className={`lifty-btn-small ${
                            isFollowingUser ? "following" : ""
                          }`}
                          onClick={() =>
                            handleFollowToggleInModal(
                              follower.id_user,
                              isFollowingUser
                            )
                          }
                          disabled={isLoadingThisUser}
                          style={{
                            minWidth: "90px",
                            background: isFollowingUser
                              ? "var(--lifty-bg-card)"
                              : "var(--lifty-accent-main)",
                            color: isFollowingUser
                              ? "var(--lifty-text-secondary)"
                              : "white",
                            border: isFollowingUser
                              ? "1.5px solid var(--lifty-border-light)"
                              : "none",
                          }}
                        >
                          {isLoadingThisUser
                            ? "..."
                            : isFollowingUser
                            ? "Siguiendo"
                            : "Seguir"}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="likes-modal-empty">No tiene seguidores aún</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Siguiendo */}
      {showFollowingModal && (
        <div
          className="likes-modal-overlay"
          onClick={() => setShowFollowingModal(false)}
        >
          <div
            className="likes-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="likes-modal-header">
              <h3>Siguiendo</h3>
              <button
                className="likes-modal-close"
                onClick={() => setShowFollowingModal(false)}
              >
                ×
              </button>
            </div>
            <div className="likes-modal-body">
              {loadingFollowing ? (
                <p className="likes-modal-empty">Cargando...</p>
              ) : followingList.length > 0 ? (
                followingList.map((following) => {
                  const isFollowingUser = followingUsers.has(following.id_user);
                  const isLoadingThisUser =
                    loadingFollowAction[following.id_user];
                  const isMe = following.id_user === currentUser?.id_user;

                  return (
                    <div key={following.id_user} className="likes-modal-user">
                      <img
                        src={
                          following.avatar_url ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            following.full_name || following.username
                          )}&background=7882b6&color=fff&size=256`
                        }
                        alt={following.username}
                        className="likes-modal-avatar"
                        onClick={() => handleUserClick(following.username)}
                      />
                      <div className="likes-modal-user-info">
                        <strong
                          className="likes-modal-username"
                          onClick={() => handleUserClick(following.username)}
                        >
                          {following.username}
                        </strong>
                        <span className="likes-modal-fullname">
                          {following.full_name}
                        </span>
                      </div>
                      {!isMe && (
                        <button
                          className={`lifty-btn-small ${
                            isFollowingUser ? "following" : ""
                          }`}
                          onClick={() =>
                            handleFollowToggleInModal(
                              following.id_user,
                              isFollowingUser
                            )
                          }
                          disabled={isLoadingThisUser}
                          style={{
                            minWidth: "90px",
                            background: isFollowingUser
                              ? "var(--lifty-bg-card)"
                              : "var(--lifty-accent-main)",
                            color: isFollowingUser
                              ? "var(--lifty-text-secondary)"
                              : "white",
                            border: isFollowingUser
                              ? "1.5px solid var(--lifty-border-light)"
                              : "none",
                          }}
                        >
                          {isLoadingThisUser
                            ? "..."
                            : isFollowingUser
                            ? "Siguiendo"
                            : "Seguir"}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="likes-modal-empty">No sigue a nadie aún</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
