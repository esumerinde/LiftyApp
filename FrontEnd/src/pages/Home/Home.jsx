import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import WorkoutCard from "../../components/WorkoutCard/WorkoutCard";
import SuggestedUsersCard from "../../components/SuggestedUsersCard/SuggestedUsersCard";
import AIRoutineWelcomeModal from "../../components/AIRoutineWelcomeModal/AIRoutineWelcomeModal";
import { Dumbbell, Home as HomeIcon, Users } from "lucide-react";
import { getCurrentUser } from "../../services/authService";
import {
  getWorkoutFeed,
  getMyWorkoutLogs,
  getFollowingWorkouts,
} from "../../services/workoutLogsService";
import {
  generateAIRoutine,
  getMyRoutines,
} from "../../services/routinesService";
import { useAuth } from "../../context/AuthContext";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updateUser, user } = useAuth();
  const [activeTab, setActiveTab] = useState(
    location.state?.tab || searchParams.get("tab") || "hub"
  );
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isActive: isWorkoutActive } = useActiveWorkout();
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiRoutineData, setAiRoutineData] = useState(null);
  const hasCheckedRoutine = useRef(false);

  // Verificar si el usuario necesita rutina con IA (cuando tiene 0 rutinas)
  useEffect(() => {
    const checkAndGenerateRoutine = async () => {
      if (!user || hasCheckedRoutine.current) return;

      hasCheckedRoutine.current = true;

      try {
        // Verificar cuántas rutinas tiene el usuario
        const routinesResult = await getMyRoutines();

        if (routinesResult.success) {
          const routinesCount = routinesResult.data?.length || 0;
          console.log(`📊 Usuario tiene ${routinesCount} rutinas`);

          // Si tiene 0 rutinas, generar una con IA
          if (routinesCount === 0) {
            console.log("🚀 Usuario sin rutinas, generando con IA...");
            const aiResult = await generateAIRoutine();

            if (aiResult.success) {
              console.log("✅ Rutina IA generada:", aiResult.data);
              setAiRoutineData(aiResult.data);
              setShowAIModal(true);
            } else {
              console.error("❌ Error generando rutina IA:", aiResult.message);
            }
          }
        }
      } catch (error) {
        console.error("❌ Error verificando rutinas:", error);
      }
    };

    checkAndGenerateRoutine();
  }, [user]);

  // Manejar callback de Google OAuth
  useEffect(() => {
    const handleGoogleCallback = async () => {
      const authStatus = searchParams.get("auth");

      if (authStatus === "success") {
        const result = await getCurrentUser();

        if (result.success && result.data?.user) {
          updateUser(result.data.user);
          window.history.replaceState({}, "", "/");
        }
      } else if (authStatus === "failed") {
        window.history.replaceState({}, "", "/");
      }
    };

    handleGoogleCallback();
  }, [searchParams, updateUser]);

  // Cargar entrenamientos según tab activo
  useEffect(() => {
    const loadWorkouts = async () => {
      setLoading(true);

      try {
        let logsData = [];

        if (activeTab === "entrenamientos") {
          const myLogsResult = await getMyWorkoutLogs();
          if (myLogsResult.success) {
            logsData = Array.isArray(myLogsResult.data)
              ? myLogsResult.data
              : [];
          } else {
            throw new Error(
              myLogsResult.message || "Error al cargar tus entrenamientos"
            );
          }
        } else if (activeTab === "seguidos") {
          const [followingResult, feedResult] = await Promise.all([
            getFollowingWorkouts(),
            getWorkoutFeed(),
          ]);

          const followingData = Array.isArray(followingResult?.data)
            ? followingResult.data
            : [];

          if (followingResult?.success && followingData.length > 0) {
            logsData = followingData;
          } else {
            const feedDataRaw = Array.isArray(feedResult?.data)
              ? feedResult.data
              : Array.isArray(feedResult?.data?.logs)
              ? feedResult.data.logs
              : [];
            logsData = feedDataRaw.filter(
              (log) => log.is_following === 1 || log.is_following === true
            );

            if (!logsData.length && !followingResult?.success) {
              throw new Error(
                followingResult?.message ||
                  "No fue posible cargar los entrenamientos de seguidos"
              );
            }
          }
        } else {
          const feedResult = await getWorkoutFeed();
          if (feedResult.success) {
            logsData = Array.isArray(feedResult.data)
              ? feedResult.data
              : Array.isArray(feedResult.data?.logs)
              ? feedResult.data.logs
              : [];
          } else {
            throw new Error(feedResult.message || "Error al cargar el feed");
          }
        }

        setWorkouts(logsData);
      } catch (error) {
        console.error("❌ loadWorkouts - Error:", error);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [activeTab]);

  // Actualizar tab desde URL o location.state
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    const tabFromState = location.state?.tab;

    const newTab = tabFromState || tabFromUrl;

    if (newTab && ["hub", "entrenamientos", "seguidos"].includes(newTab)) {
      setActiveTab(newTab);
    }
  }, [searchParams, location.state]);

  const handleFabClick = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(isWorkoutActive ? "/workout" : "/workout-hub");
  };

  // Optimización: useCallback para evitar recrear esta función en cada render
  const handleFollowChange = useCallback((userId, isNowFollowing) => {
    setWorkouts((prev) =>
      prev.map((w) =>
        w.id_user === userId
          ? { ...w, is_following: isNowFollowing ? 1 : 0 }
          : w
      )
    );
  }, []);

  // Optimización: getTimeAgo como useCallback
  const getTimeAgo = useCallback((dateString) => {
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
  }, []);

  // Convertir datos del backend a formato de WorkoutCard
  const formatWorkoutData = useCallback(
    (log) => {
      // Usar end_time si existe, sino log_date, sino created_at
      const timeReference = log.end_time || log.log_date || log.created_at;
      const timeAgo = getTimeAgo(timeReference);

      // Formatear latestComment si existe
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
        exercises: [], // Se cargarán async en el WorkoutCard
        likes: log.likes_count || 0,
        comments: log.comments_count || 0,
        latestComment,
        isOwnWorkout: user?.id_user === log.id_user,
        isFollowing: log.is_following === 1, // Usar el campo del backend directamente
        liked: log.user_liked === 1,
      };
    },
    [user, getTimeAgo]
  );

  // Optimización: Memorizar workouts formateados
  const formattedWorkouts = useMemo(() => {
    return workouts.map(formatWorkoutData);
  }, [workouts, formatWorkoutData]);

  return (
    <div className="home-page page-wrapper">
      {/* AI Routine Welcome Modal */}
      {showAIModal && aiRoutineData && (
        <AIRoutineWelcomeModal
          routineId={aiRoutineData.routineId}
          routineName={aiRoutineData.routineName}
          onClose={() => {
            setShowAIModal(false);
          }}
        />
      )}

      {/* Filter Tabs */}
      <div className="home-tabs">
        <button
          className={`home-tab ${activeTab === "hub" ? "active" : ""}`}
          onClick={() => setActiveTab("hub")}
        >
          <HomeIcon size={20} strokeWidth={2} />
          <span>Hub</span>
        </button>
        <button
          className={`home-tab ${
            activeTab === "entrenamientos" ? "active" : ""
          }`}
          onClick={() => setActiveTab("entrenamientos")}
        >
          <Dumbbell size={20} strokeWidth={2} />
          <span>Mi Actividad</span>
        </button>
        <button
          className={`home-tab ${activeTab === "seguidos" ? "active" : ""}`}
          onClick={() => setActiveTab("seguidos")}
        >
          <Users size={20} strokeWidth={2} />
          <span>Seguidos</span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="home-hero">
        <h1 className="home-title">HUB DE ENTRENAMIENTO</h1>
        <p className="home-subtitle">
          Descubre entrenamientos de otros atletas, sigue a tus amigos y
          comparte tu progreso con la comunidad.
        </p>
      </div>

      {/* Feed de entrenamientos */}
      <div className="home-feed">
        {loading ? (
          <div className="loading-feed">
            <div className="loading-spinner"></div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="empty-feed">
            <Dumbbell className="empty-icon" size={64} />
            <h3>No hay entrenamientos</h3>
            <p>
              {activeTab === "entrenamientos"
                ? "Aún no has registrado ningún entrenamiento. ¡Comienza ahora!"
                : "No hay entrenamientos para mostrar. Sigue a más personas o crea tu primer entrenamiento."}
            </p>
          </div>
        ) : (
          <>
            {/* Primera card */}
            {formattedWorkouts.length > 0 && (
              <WorkoutCard
                workout={formattedWorkouts[0]}
                isOwnWorkout={user?.id_user === workouts[0].id_user}
                isFollowing={workouts[0].is_following === 1}
                onFollowChange={handleFollowChange}
              />
            )}

            {/* Usuarios Sugeridos después de la 1ra card (solo en HUB) */}
            {activeTab === "hub" && formattedWorkouts.length > 0 && (
              <SuggestedUsersCard />
            )}

            {/* Cards 2-4 */}
            {formattedWorkouts.slice(1, 4).map((workout, idx) => (
              <WorkoutCard
                key={workouts[idx + 1].id_log}
                workout={workout}
                isOwnWorkout={user?.id_user === workouts[idx + 1].id_user}
                isFollowing={workouts[idx + 1].is_following === 1}
                onFollowChange={handleFollowChange}
              />
            ))}

            {/* Spotify Carousel después de la 4ta card */}

            {/* Card 5 */}
            {formattedWorkouts.length >= 5 && (
              <WorkoutCard
                key={workouts[4].id_log}
                workout={formattedWorkouts[4]}
                isOwnWorkout={user?.id_user === workouts[4].id_user}
                isFollowing={workouts[4].is_following === 1}
                onFollowChange={handleFollowChange}
              />
            )}

            {/* Resto de las cards (desde la 6ta en adelante) */}
            {formattedWorkouts.slice(5).map((workout, idx) => (
              <WorkoutCard
                key={workouts[idx + 5].id_log}
                workout={workout}
                isOwnWorkout={user?.id_user === workouts[idx + 5].id_user}
                isFollowing={workouts[idx + 5].is_following === 1}
                onFollowChange={handleFollowChange}
              />
            ))}
          </>
        )}
      </div>

      {/* Floating Action Button - Entrenar */}
      <button
        className="lifty-fab-action"
        onClick={handleFabClick}
        aria-label={isWorkoutActive ? "Volver al entrenamiento" : "Entrenar"}
      >
        <Dumbbell className="lifty-fab-action-icon" size={24} strokeWidth={2} />
        <span className="lifty-fab-action-label">
          {isWorkoutActive ? "Volver" : "Entrenar"}
        </span>
      </button>
    </div>
  );
};

export default Home;
