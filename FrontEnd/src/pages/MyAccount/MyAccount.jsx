import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Dumbbell,
  Edit3,
  BarChart2,
  User,
  UtensilsCrossed,
  Target,
  Settings,
  LogOut,
} from "lucide-react";
import { Line } from "react-chartjs-2";
import WorkoutCard from "../../components/WorkoutCard/WorkoutCard";
import EditProfileModal from "../../components/EditProfileModal/EditProfileModal";
import { getMyProfile } from "../../services/profileService";
import { getMyWorkoutLogs } from "../../services/workoutLogsService";
import { getUserStats } from "../../services/usersService";
import {
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
} from "../../services/usersService";
import { logout as logoutService } from "../../services/authService";
import { AuthContext } from "../../context/AuthContext";
import "./MyAccount.css";

const MyAccount = () => {
  const { updateUser, clearAuth } = useContext(AuthContext);
  const navigate = useNavigate();

  const workoutsRef = useRef(null);

  const [chartMetric, setChartMetric] = useState("duration");
  const [userData, setUserData] = useState(null);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const [myWorkouts, setMyWorkouts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);

  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);

  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [loadingFollowAction, setLoadingFollowAction] = useState({});

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return date.toLocaleDateString("es-ES", options);
  };
  const handleLogout = async () => {
    console.log("Cerrando sesión...");
    await logoutService();
    clearAuth();
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/login");
  };

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [profileResult, workoutsResult] = await Promise.all([
        getMyProfile(),
        getMyWorkoutLogs(),
      ]);

      if (profileResult.success) {
        setUserData(profileResult.data);
        setAvatarLoadError(false);
      }

      if (workoutsResult.success && Array.isArray(workoutsResult.data)) {
        const transformedWorkouts = workoutsResult.data.map((log) => ({
          id: log.id_log,
          user: {
            name: log.full_name,
            avatar: log.avatar_url,
          },
          title: log.title,
          timeAgo: formatDate(log.log_date),
          duration: `${log.duration_minutes} min`,
          volume: "0 kg", // TODO: calcular volumen real
          image: null,
          exercises: [], // TODO: obtener ejercicios del log
          likes: log.likes_count || 0,
          comments: 0, // TODO: obtener count de comentarios
        }));

        setMyWorkouts(transformedWorkouts);
      } else {
        setMyWorkouts([]);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
      setUserData(null);
      setMyWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileData();
  }, [loadProfileData]);

  const loadChartData = useCallback(
    async (type) => {
      if (!userData?.id_user) return;

      setLoadingChart(true);
      try {
        const result = await getUserStats(userData.id_user, type);
        if (result.success && result.data) {
          const formattedData = result.data.map((item) => ({
            date:
              new Date(item.date).getDate() +
              "/" +
              (new Date(item.date).getMonth() + 1),
            value: item.value,
          }));
          setChartData(formattedData);
        } else {
          setChartData([]);
        }
      } catch (error) {
        console.error("Error loading chart:", error);
        setChartData([]);
      } finally {
        setLoadingChart(false);
      }
    },
    [userData?.id_user]
  );

  useEffect(() => {
    if (userData?.id_user) {
      loadChartData(chartMetric);
    }
  }, [chartMetric, userData?.id_user, loadChartData]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [userData?.avatar_url]);

  const handleSavedRoutinesClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    navigate("/my-saved-routines");
  };

  const handleWorkoutsClick = () => {
    workoutsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleFollowersClick = async () => {
    if (!userData?.id_user) return;

    setShowFollowersModal(true);
    setLoadingFollowers(true);

    try {
      const [followersResult, followingResult] = await Promise.all([
        getUserFollowers(userData.id_user),
        getUserFollowing(userData.id_user),
      ]);

      if (followersResult.success) {
        setFollowersList(followersResult.data || []);
      } else {
        setFollowersList([]);
      }

      if (followingResult.success) {
        setFollowingUsers(
          new Set((followingResult.data || []).map((u) => u.id_user))
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
    if (!userData?.id_user) return;

    setShowFollowingModal(true);
    setLoadingFollowing(true);

    try {
      const result = await getUserFollowing(userData.id_user);
      if (result.success) {
        const followingData = result.data || [];
        setFollowingList(followingData);
        setFollowingUsers(new Set(followingData.map((u) => u.id_user)));
      } else {
        setFollowingList([]);
      }
    } catch (error) {
      console.error("Error loading following:", error);
      setFollowingList([]);
    } finally {
      setLoadingFollowing(false);
    }
  };

  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  const handleFollowToggle = async (userId, isFollowing) => {
    setLoadingFollowAction((prev) => ({ ...prev, [userId]: true }));

    try {
      const result = isFollowing
        ? await unfollowUser(userId)
        : await followUser(userId);

      if (result.success) {
        setFollowingUsers((prev) => {
          const newSet = new Set(prev);
          if (isFollowing) newSet.delete(userId);
          else newSet.add(userId);
          return newSet;
        });

        setUserData((prev) =>
          prev
            ? {
                ...prev,
                following_count: isFollowing
                  ? Math.max((prev.following_count || 0) - 1, 0)
                  : (prev.following_count || 0) + 1,
              }
            : prev
        );

        if (showFollowingModal && isFollowing) {
          setFollowingList((prev) => prev.filter((u) => u.id_user !== userId));
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    } finally {
      setLoadingFollowAction((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setUserData((prev) => ({ ...prev, ...updatedUser }));
    updateUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="profile-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Error al cargar el perfil</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* HERO SECTION */}
      <div className="profile-hero">
        <h1 className="profile-hero-title">MI CUENTA</h1>
        <p className="profile-hero-subtitle">
          Revisa tus estadísticas, entrenamientos y progreso personal.
        </p>
      </div>

      {/* INFO DEL USUARIO */}
      <div className="profile-info-section">
        <div className="profile-header-row">
          <div className="profile-avatar-container">
            {userData.avatar_url && !avatarLoadError ? (
              <img
                src={userData.avatar_url}
                alt="Profile"
                className="profile-avatar"
                onLoad={() => setAvatarLoadError(false)}
                onError={() => setAvatarLoadError(true)}
              />
            ) : userData.avatar_url && avatarLoadError ? (
              <div className="profile-avatar-error">
                <div className="profile-avatar-error-x">✖</div>
                <div className="profile-avatar-error-text">No disponible</div>
              </div>
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.full_name || "User"
                )}&background=7882b6&color=fff&size=256`}
                alt="Profile"
                className="profile-avatar"
              />
            )}
          </div>

          <div className="profile-stats-container">
            <div
              className="profile-stat-item"
              onClick={handleWorkoutsClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {userData.workouts_count || 0}
              </span>
              <span className="stat-label">Entrenos</span>
            </div>

            <div
              className="profile-stat-item"
              onClick={handleFollowersClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {userData.followers_count || 0}
              </span>
              <span className="stat-label">Seguidores</span>
            </div>

            <div
              className="profile-stat-item"
              onClick={handleFollowingClick}
              style={{ cursor: "pointer" }}
            >
              <span className="stat-number">
                {userData.following_count || 0}
              </span>
              <span className="stat-label">Siguiendo</span>
            </div>
          </div>
        </div>

        <div className="profile-bio-section">
          <div className="profile-name-row">
            <h2 className="profile-fullname">{userData.full_name}</h2>

            <div className="profile-actions">
              <button
                className="nav-icon-btn"
                onClick={() => setShowEditModal(true)}
                aria-label="Editar perfil"
              >
                <Edit3 size={20} />
              </button>

              <button
                className="nav-icon-btn"
                onClick={handleSavedRoutinesClick}
                aria-label="Mis rutinas"
              >
                <Target size={20} />
              </button>
            </div>
          </div>

          <p className="profile-username">@{userData.username}</p>
          <p className="profile-bio">
            {userData.bio || "Agrega información sobre ti"}
          </p>
        </div>
      </div>

      {/* GRÁFICO / CHART SECTION */}
      <div className="profile-chart-section">
        <div className="chart-header">
          <h3 className="chart-title">
            {chartMetric === "duration"
              ? "Duración"
              : chartMetric === "volume"
              ? "Volumen"
              : "Repeticiones"}
          </h3>
          <span className="chart-period">Última semana</span>
        </div>

        <div className="chart-container">
          {loadingChart ? (
            <>
              <BarChart2 size={48} className="chart-icon-placeholder" />
              <p className="chart-empty-text">Cargando...</p>
            </>
          ) : chartData.length === 0 ? (
            <>
              <BarChart2 size={48} className="chart-icon-placeholder" />
              <p className="chart-empty-text">Sin datos en este período</p>
            </>
          ) : (
            <Line
              data={{
                labels: chartData.map((item) => item.date),
                datasets: [
                  {
                    label:
                      chartMetric === "duration"
                        ? "Minutos"
                        : chartMetric === "volume"
                        ? "kg × reps"
                        : "Repeticiones",
                    data: chartData.map((item) => item.value),
                    borderColor: "rgb(120, 130, 182)",
                    backgroundColor: "rgba(120, 130, 182, 0.15)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "rgb(120, 130, 182)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                    borderWidth: 2.5,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    titleColor: "#9ca3af",
                    bodyColor: "#7882b6",
                    borderColor: "rgba(120, 130, 182, 0.2)",
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 15,
                      weight: "bold",
                    },
                    titleFont: {
                      size: 12,
                    },
                    displayColors: false,
                    callbacks: {
                      label: function (context) {
                        let label = context.dataset.label || "";
                        if (label) {
                          label += ": ";
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y;
                        }
                        return label;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    display: true,
                    grid: {
                      color: "rgba(120, 130, 182, 0.08)",
                      drawBorder: false,
                    },
                    ticks: {
                      color: "#9ca3af",
                      font: {
                        size: 11,
                      },
                    },
                  },
                  y: {
                    display: true,
                    grid: {
                      color: "rgba(120, 130, 182, 0.08)",
                      drawBorder: false,
                    },
                    ticks: {
                      color: "#9ca3af",
                      font: {
                        size: 11,
                      },
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          )}
        </div>

        <div className="chart-toggles">
          <button
            className={`lifty-btn-small filter-chip ${
              chartMetric === "duration" ? "active" : ""
            }`}
            onClick={() => setChartMetric("duration")}
          >
            Duración
          </button>
          <button
            className={`lifty-btn-small filter-chip ${
              chartMetric === "volume" ? "active" : ""
            }`}
            onClick={() => setChartMetric("volume")}
          >
            Volumen
          </button>
          <button
            className={`lifty-btn-small filter-chip ${
              chartMetric === "reps" ? "active" : ""
            }`}
            onClick={() => setChartMetric("reps")}
          >
            Reps
          </button>
        </div>
      </div>

      {/* DASHBOARD MENU */}
      <div className="dashboard-menu-grid">
        <button
          type="button"
          className="dashboard-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/statistics");
          }}
        >
          <Activity size={20} className="dashboard-icon" />
          <span>Estadísticas</span>
        </button>

        <button
          type="button"
          className="dashboard-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/calendar");
          }}
        >
          <Calendar size={20} className="dashboard-icon" />
          <span>Calendario</span>
        </button>

        <button
          type="button"
          className="dashboard-btn"
          onClick={handleSavedRoutinesClick}
        >
          <Target size={20} className="dashboard-icon" />
          <span>Mis Rutinas</span>
        </button>

        <button 
          type="button" 
          className="dashboard-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate("/meals");
          }}
        >
          <UtensilsCrossed size={20} className="dashboard-icon" />
          <span>Mis Dietas</span>
        </button>

        <button
          type="button"
          className="dashboard-btn"
          onClick={() => navigate("/my-data")}
        >
          <Settings size={20} className="dashboard-icon" />
          <span>Mis datos</span>
        </button>

        <button 
          type="button" 
          className="dashboard-btn"
          onClick={handleLogout}
        >
          <LogOut size={20} className="dashboard-icon" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* LISTA DE ENTRENAMIENTOS */}
      <div className="profile-workouts-feed" ref={workoutsRef}>
        <div className="section-header">
          <h3 className="section-label">Mis Entrenamientos</h3>
          <p className="section-subtitle">
            Tus rutinas de entrenamiento guardadas y personalizadas
          </p>
        </div>

        <div className="workouts-list">
          {myWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isOwnWorkout={true}
              inProfile={true}
            />
          ))}
        </div>
      </div>

      {/* MODAL EDICIÓN PERFIL */}
      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentProfile={userData}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* MODAL SEGUIDORES */}
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
                  const isFollowing = followingUsers.has(follower.id_user);
                  const isLoadingThisUser =
                    loadingFollowAction[follower.id_user];

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
                        onClick={() => {
                          setShowFollowersModal(false);
                          handleUserClick(follower.username);
                        }}
                      />

                      <div className="likes-modal-user-info">
                        <strong
                          className="likes-modal-username"
                          onClick={() => {
                            setShowFollowersModal(false);
                            handleUserClick(follower.username);
                          }}
                        >
                          {follower.username}
                        </strong>
                        <span className="likes-modal-fullname">
                          {follower.full_name}
                        </span>
                      </div>

                      <button
                        className={`lifty-btn-small ${
                          isFollowing ? "following" : ""
                        }`}
                        onClick={() =>
                          handleFollowToggle(follower.id_user, isFollowing)
                        }
                        disabled={isLoadingThisUser}
                        style={{
                          minWidth: "90px",
                          background: isFollowing
                            ? "var(--lifty-bg-card)"
                            : "var(--lifty-accent-main)",
                          color: isFollowing
                            ? "var(--lifty-text-secondary)"
                            : "white",
                          border: isFollowing
                            ? "1.5px solid var(--lifty-border-light)"
                            : "none",
                        }}
                      >
                        {isLoadingThisUser
                          ? "..."
                          : isFollowing
                          ? "Siguiendo"
                          : "Seguir"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="likes-modal-empty">No tenés seguidores aún</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIGUIENDO */}
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
                  const isLoadingThisUser =
                    loadingFollowAction[following.id_user];

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
                        onClick={() => {
                          setShowFollowingModal(false);
                          handleUserClick(following.username);
                        }}
                      />

                      <div className="likes-modal-user-info">
                        <strong
                          className="likes-modal-username"
                          onClick={() => {
                            setShowFollowingModal(false);
                            handleUserClick(following.username);
                          }}
                        >
                          {following.username}
                        </strong>
                        <span className="likes-modal-fullname">
                          {following.full_name}
                        </span>
                      </div>

                      <button
                        className="lifty-btn-small following"
                        onClick={() =>
                          handleFollowToggle(following.id_user, true)
                        }
                        disabled={isLoadingThisUser}
                        style={{
                          minWidth: "90px",
                          background: "var(--lifty-bg-card)",
                          color: "var(--lifty-text-secondary)",
                          border: "1.5px solid var(--lifty-border-light)",
                        }}
                      >
                        {isLoadingThisUser ? "..." : "Siguiendo"}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="likes-modal-empty">
                  No estás siguiendo a nadie aún
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAccount;
