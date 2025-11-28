import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { UserPlus, Calendar, Users, Dumbbell } from "lucide-react";
import { followUser, unfollowUser, getUsersByRole } from "../../services/usersService";
import AllExercises from "../AllExercises/AllExercises";
import "./Explore.css";

const Explore = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "routines");
  const [routines, setRoutines] = useState({
    trending: [],
    popular: [],
    trainers: [],
    recommended: [],
  });
  const [_loading, setLoading] = useState(true);

  // Efecto para cambiar la pestaña cuando cambia el parámetro URL
  useEffect(() => {
    if (
      tabFromUrl &&
      (tabFromUrl === "routines" ||
        tabFromUrl === "exercises" ||
        tabFromUrl === "professionals")
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Estados para profesionales desde API
  const [trainers, setTrainers] = useState([]);
  const [nutritionists, setNutritionists] = useState([]);
  const [trainerFollowState, setTrainerFollowState] = useState({});
  const [nutritionistFollowState, setNutritionistFollowState] = useState({});
  const [trainerFollowLoading, setTrainerFollowLoading] = useState(false);
  const [nutritionistFollowLoading, setNutritionistFollowLoading] =
    useState(false);

  const formatProfessional = (user, role) => {
    if (!user) return null;

    const fullName =
      user.full_name ||
      [user.first_name, user.last_name].filter(Boolean).join(" ") ||
      user.username ||
      "Profesional";

    const username = (user.username || user.email?.split("@")[0] || "").replace(
      /^@/,
      ""
    );

    const defaultTitle =
      role === "trainer"
        ? "Entrenador Personal Certificado"
        : "Nutricionista Deportivo";

    const formatted = {
      id: user.id_user ?? user.id,
      fullName,
      username,
      title: user.professional_title || user.title || defaultTitle,
      specialization:
        user.specialization ||
        (role === "trainer" ? "Entrenador" : "Nutricionista"),
      roleLabel: role === "trainer" ? "Entrenador" : "Nutricionista",
      avatar:
        user.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName
        )}&background=7882b6&color=fff&size=180`,
      bio: user.bio || user.description || "",
      isFollowed: Boolean(
        user.is_following ??
          user.isFollowed ??
          user.following ??
          user.is_followed ??
          user.isFollowing ??
          0
      ),
    };

    return formatted;
  };

  // ==========================================
  // UTILITY: Mapeo de dificultad
  // ==========================================
  const mapDifficulty = (difficulty) => {
    const map = {
      easy: "Principiante",
      medium: "Intermedio",
      hard: "Avanzado",
    };
    return map[difficulty] || difficulty;
  };

  // ==========================================
  // FETCH: Cargar rutinas destacadas desde la API
  // ==========================================
  useEffect(() => {
    const fetchFeaturedRoutines = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "http://localhost:3000/api/routines/featured"
        );
        const result = await response.json();

        // El backend devuelve {success: true, data: {trending, popular, ...}}
        const data = result.success ? result.data : result;

        // Transformar datos para que coincidan con el formato del frontend
        // Helper para randomizar array
        const shuffleArray = (array) => {
          const shuffled = [...array];
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          return shuffled;
        };

        const transformedData = {
          trending: shuffleArray(
            data.trending?.map((r) => ({
              id: r.id_routine,
              title: r.title,
              duration: r.duration,
              difficulty: mapDifficulty(r.difficulty),
              image: r.image_url,
              isPremium: r.is_premium,
              description: r.description,
            })) || []
          ),
          popular: shuffleArray(
            data.popular?.map((r) => ({
              id: r.id_routine,
              title: r.title,
              duration: r.duration,
              difficulty: mapDifficulty(r.difficulty),
              image: r.image_url,
              isPremium: r.is_premium,
              description: r.description,
            })) || []
          ),
          trainers: shuffleArray(
            data.trainers?.map((r) => ({
              id: r.id_routine,
              title: r.title,
              duration: r.duration,
              difficulty: mapDifficulty(r.difficulty),
              image: r.image_url,
              isPremium: r.is_premium,
              description: r.description,
            })) || []
          ),
          recommended: shuffleArray(
            data.recommended?.map((r) => ({
              id: r.id_routine,
              title: r.title,
              duration: r.duration,
              difficulty: mapDifficulty(r.difficulty),
              image: r.image_url,
              isPremium: r.is_premium,
              description: r.description,
            })) || []
          ),
        };

        setRoutines(transformedData);
      } catch (error) {
        console.error("Error al cargar rutinas destacadas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedRoutines();
  }, []);

  // ==========================================
  // 1. DATA DE RUTINAS (Ahora desde API - mock data removido)
  // ==========================================

  // ==========================================

  // ==========================================
  // 2. DATA DE PROFESIONALES (6 de cada uno)
  // ==========================================

  // Funciones de scroll EXACTAMENTE IGUAL QUE SUGGESTEDUSERSCARD
  const formatProfessionals = (users, role) =>
    (users || []).map((user) => formatProfessional(user, role)).filter(Boolean);

  // Cargar profesionales desde la API
  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        const [trainersResult, nutritionistsResult] = await Promise.all([
          getUsersByRole("trainer"),
          getUsersByRole("nutritionist"),
        ]);

        const trainersData = trainersResult.success ? trainersResult.data : [];
        const nutritionistsData = nutritionistsResult.success ? nutritionistsResult.data : [];

        const formattedTrainers = formatProfessionals(trainersData, "trainer");
        const formattedNutritionists = formatProfessionals(
          nutritionistsData,
          "nutritionist"
        );

        setTrainers(formattedTrainers);
        setNutritionists(formattedNutritionists);

        setTrainerFollowState(
          formattedTrainers.reduce((acc, professional) => {
            acc[professional.id] = Boolean(professional.isFollowed);
            return acc;
          }, {})
        );

        setNutritionistFollowState(
          formattedNutritionists.reduce((acc, professional) => {
            acc[professional.id] = Boolean(professional.isFollowed);
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Error al cargar profesionales:", error);
      }
    };

    fetchProfessionals();
  }, []);

  // Filtrar rutinas SIN IMAGEN (null, undefined, o string vacío)
  const filterRoutinesWithImage = (routines) => {
    return routines.filter(
      (routine) =>
        routine.image &&
        routine.image.trim() !== "" &&
        routine.image !== null &&
        routine.image !== undefined
    );
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  const handleViewProfile = (username) => {
    if (!username) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/profile/${username}`);
  };

  const handleViewProfessionalContent = (type) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (type === "trainer") {
      navigate("/routines?filter=trainers");
    } else if (type === "nutritionist") {
      navigate("/meals");
    }
  };

  const handleRoutineClick = (routineId) => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/routine/${routineId}`);
  };

  const handleToggleFollow = async (professional, type) => {
    if (!professional?.id) return;

    const currentState =
      type === "trainer"
        ? trainerFollowState[professional.id]
        : nutritionistFollowState[professional.id];
    const isCurrentlyFollowing = Boolean(currentState);

    const setState =
      type === "trainer" ? setTrainerFollowState : setNutritionistFollowState;
    const setLoading =
      type === "trainer"
        ? setTrainerFollowLoading
        : setNutritionistFollowLoading;
    const setProfessionals =
      type === "trainer" ? setTrainers : setNutritionists;

    try {
      setLoading(true);

      if (isCurrentlyFollowing) {
        await unfollowUser(professional.id);
      } else {
        await followUser(professional.id);
      }

      setState((prev) => ({
        ...prev,
        [professional.id]: !isCurrentlyFollowing,
      }));

      setProfessionals((prev) =>
        prev.map((item) =>
          item.id === professional.id
            ? { ...item, isFollowed: !isCurrentlyFollowing }
            : item
        )
      );
    } catch (error) {
      console.error("Error al actualizar seguimiento:", error);
      window.alert("No se pudo actualizar el seguimiento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Componente interno reutilizable
  const RoutineSection = ({ title, subtitle, data }) => (
    <div className="explore-routine-section">
      <div className="section-header-explore">
        <h3 className="section-label-explore">{title}</h3>
        {subtitle && <p className="section-subtitle-explore">{subtitle}</p>}
      </div>
      <div className="explore-routine-scroll">
        {data.map((routine) => {
          console.log(
            "Routine:",
            routine.title,
            "isPremium:",
            routine.isPremium,
            "Type:",
            typeof routine.isPremium
          );
          return (
            <div
              key={routine.id}
              className="explore-routine-card"
              onClick={() => handleRoutineClick(routine.id)}
              style={{ cursor: "pointer" }}
            >
              <div className="explore-routine-image-container">
                <img
                  src={routine.image}
                  alt={routine.title}
                  className="explore-routine-image"
                />
                <div className="explore-routine-overlay"></div>
                {(routine.isPremium === true || routine.isPremium === 1) && (
                  <span className="explore-routine-premium-chip">PREMIUM</span>
                )}
              </div>
              <div className="explore-routine-info">
                <h4 className="explore-routine-title">{routine.title}</h4>
                <div className="explore-routine-meta">
                  <span className="explore-routine-badge">
                    {routine.duration}
                  </span>
                  <span className="explore-routine-badge">
                    {routine.difficulty}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ProfessionalCard = ({
    professional,
    secondaryActionLabel,
    isFollowing,
    isLoading,
    onToggleFollow,
    onViewProfile,
    onSecondaryAction,
  }) => {
    if (!professional) return null;

    const followButtonClass = [
      "lifty-btn-secondary-dark",
      "professional-card-follow",
      isFollowing ? "active" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="professional-card">
        <div className="professional-card-header">
          <div className="professional-card-avatar">
            <img
              src={professional.avatar}
              alt={professional.fullName}
              className="professional-card-avatar-img"
            />
          </div>
          <div className="professional-card-info">
            <span className="professional-card-role">
              {professional.roleLabel}
            </span>
            <h4 className="professional-card-name">{professional.fullName}</h4>
            {professional.username && (
              <span className="professional-card-username">
                @{professional.username}
              </span>
            )}
            <p className="professional-card-title">{professional.title}</p>
          </div>
        </div>

        <div className="professional-card-actions">
          <button
            className={followButtonClass}
            onClick={() => onToggleFollow?.(professional)}
            disabled={isLoading}
            aria-pressed={Boolean(isFollowing)}
            type="button"
          >
            {!isFollowing && <UserPlus size={16} strokeWidth={2} />}
            {isFollowing ? "Siguiendo" : "Seguir"}
          </button>
          <div className="professional-card-secondary-actions">
            <button
              className="lifty-btn-secondary-dark professional-card-secondary"
              onClick={() => onViewProfile?.(professional.username)}
              type="button"
            >
              Ver Perfil
            </button>
            <button
              className="lifty-btn-secondary-dark professional-card-secondary"
              onClick={() => onSecondaryAction?.()}
              type="button"
            >
              {secondaryActionLabel}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="explore-page fade-in">
      {/* Tabs */}
      <div className="explore-tabs">
        <button
          className={`explore-tab ${activeTab === "routines" ? "active" : ""}`}
          onClick={() => handleTabChange("routines")}
        >
          <Calendar size={20} strokeWidth={2} />
          <span>Rutinas</span>
        </button>
        <button
          className={`explore-tab ${
            activeTab === "professionals" ? "active" : ""
          }`}
          onClick={() => handleTabChange("professionals")}
        >
          <Users size={20} strokeWidth={2} />
          <span>Profesionales</span>
        </button>
        <button
          className={`explore-tab ${activeTab === "exercises" ? "active" : ""}`}
          onClick={() => handleTabChange("exercises")}
        >
          <Dumbbell size={20} strokeWidth={2} />
          <span>Ejercicios</span>
        </button>
      </div>

      <div className="explore-content">
        {/* 1. VISTA RUTINAS (Orden Solicitado) */}
        {activeTab === "routines" && (
          <div className="routines-view">
            <RoutineSection
              title="Rutinas en Tendencia"
              subtitle="Las rutinas más populares del momento"
              data={filterRoutinesWithImage(routines.trending)}
            />
            <RoutineSection
              title="Rutinas Populares"
              subtitle="Rutinas con mejor valoración de la comunidad"
              data={filterRoutinesWithImage(routines.popular)}
            />
            <RoutineSection
              title="Rutinas de Profesionales"
              subtitle="Creadas por nuestros entrenadores certificados"
              data={filterRoutinesWithImage(routines.trainers)}
            />
            <RoutineSection
              title="Recomendados para ti"
              subtitle="Rutinas seleccionadas según tus objetivos"
              data={filterRoutinesWithImage(routines.recommended)}
            />
          </div>
        )}

        {/* 2. VISTA PROFESIONALES */}
        {activeTab === "professionals" && (
          <div className="professionals-view">
            <div className="professional-section">
              <div className="section-header-explore">
                <h3 className="section-label-explore">Nuestros Entrenadores</h3>
                <p className="section-subtitle-explore">
                  Expertos certificados en fitness y nutrición deportiva
                </p>
              </div>
              {trainers.length > 0 ? (
                <ProfessionalCard
                  professional={trainers[0]}
                  secondaryActionLabel="Ver Rutinas"
                  isFollowing={Boolean(trainerFollowState[trainers[0].id])}
                  isLoading={trainerFollowLoading}
                  onToggleFollow={(professional) =>
                    handleToggleFollow(professional, "trainer")
                  }
                  onViewProfile={handleViewProfile}
                  onSecondaryAction={() =>
                    handleViewProfessionalContent("trainer")
                  }
                />
              ) : (
                <p className="professional-placeholder-text">
                  Próximamente entrenadores disponibles.
                </p>
              )}
            </div>

            <div className="professional-section">
              <div className="section-header-explore">
                <h3 className="section-label-explore">
                  Nuestros Nutricionistas
                </h3>
                <p className="section-subtitle-explore">
                  Profesionales especializados en nutrición y planes
                  alimenticios
                </p>
              </div>
              {nutritionists.length > 0 ? (
                <ProfessionalCard
                  professional={nutritionists[0]}
                  secondaryActionLabel="Ver Dietas"
                  isFollowing={Boolean(
                    nutritionistFollowState[nutritionists[0].id]
                  )}
                  isLoading={nutritionistFollowLoading}
                  onToggleFollow={(professional) =>
                    handleToggleFollow(professional, "nutritionist")
                  }
                  onViewProfile={handleViewProfile}
                  onSecondaryAction={() =>
                    handleViewProfessionalContent("nutritionist")
                  }
                />
              ) : (
                <p className="professional-placeholder-text">
                  Próximamente nutricionistas disponibles.
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. VISTA EJERCICIOS - Usando AllExercises */}
        {activeTab === "exercises" && <AllExercises />}
      </div>
    </div>
  );
};

export default Explore;
