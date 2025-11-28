import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  User,
  Scale,
  Activity,
  Target,
  ChevronLeft,
  Camera,
} from "lucide-react";
import { getMyProfile } from "../../services/profileService";
import EditAvatarModal from "../../components/EditModals/EditAvatarModal";
import EditPersonalInfoModal from "../../components/EditModals/EditPersonalInfoModal";
import EditPhysicalDataModal from "../../components/EditModals/EditPhysicalDataModal";
import EditLifestyleModal from "../../components/EditModals/EditLifestyleModal";
import EditGoalsModal from "../../components/EditModals/EditGoalsModal";
import "./MyData.css";

const MyData = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showPhysicalModal, setShowPhysicalModal] = useState(false);
  const [showLifestyleModal, setShowLifestyleModal] = useState(false);
  const [showGoalsModal, setShowGoalsModal] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const result = await getMyProfile();
      if (result.success) {
        setUserData(result.data);
      }
    } catch (error) {
      console.error("Error cargando perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdated = (updatedUser) => {
    setUserData((prev) => ({
      ...prev,
      ...updatedUser,
    }));
  };

  // Mapeos de valores a texto legible
  const genderLabels = {
    male: "Masculino",
    female: "Femenino",
    other: "Otro",
  };

  const lifestyleLabels = {
    sedentary: "Sedentario",
    light: "Ligero",
    moderate: "Moderado",
    active: "Activo",
    very_active: "Muy Activo",
  };

  const dietLabels = {
    omnivore: "Omnívoro",
    vegan: "Vegano",
    vegetarian: "Vegetariano",
    keto: "Keto",
    low_carb: "Bajo en Carbohidratos",
  };

  const goalLabels = {
    lose_weight: "Perder Peso",
    gain_muscle: "Ganar Músculo",
    get_toned: "Tonificar y Definir",
    maintain: "Mantenerme Saludable",
  };

  if (isLoading) {
    return (
      <div className="my-data-page">
        <div className="loading-container">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-data-page">
      <div className="my-data-container">
        {/* Header */}
        <div className="section-header">
          <button className="lifty-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
          <h2 className="section-label">MIS DATOS</h2>
          <p className="section-subtitle">
            Toda tu información personal y preferencias
          </p>
        </div>

        {/* Avatar y datos básicos */}
        <div className="data-section">
          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                src={
                  userData?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${
                    userData?.full_name || "User"
                  }&background=7882b6&color=fff&size=128`
                }
                alt="Avatar"
                className="profile-avatar-large"
              />
              <button
                className="avatar-camera-btn"
                onClick={() => setShowAvatarModal(true)}
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          <div className="data-grid">
            {/* Información Personal */}
            <div className="data-category">
              <div className="category-header">
                <h3 className="category-title">
                  <User size={20} />
                  Información Personal
                </h3>
                <button
                  className="category-edit-btn"
                  onClick={() => setShowPersonalModal(true)}
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="data-item">
                <span className="data-label">Nombre Completo</span>
                <span className="data-value">
                  {userData?.full_name || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Nombre de Usuario</span>
                <span className="data-value">
                  @{userData?.username || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Email</span>
                <span className="data-value">
                  {userData?.email || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Biografía</span>
                <span className="data-value">
                  {userData?.bio || "Sin biografía"}
                </span>
              </div>
            </div>

            {/* Datos Físicos */}
            <div className="data-category">
              <div className="category-header">
                <h3 className="category-title">
                  <Scale size={20} />
                  Datos Físicos
                </h3>
                <button
                  className="category-edit-btn"
                  onClick={() => setShowPhysicalModal(true)}
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="data-item">
                <span className="data-label">Género</span>
                <span className="data-value">
                  {genderLabels[userData?.gender] || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Peso</span>
                <span className="data-value">
                  {userData?.current_weight_kg
                    ? `${userData.current_weight_kg} kg`
                    : "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Altura</span>
                <span className="data-value">
                  {userData?.height_cm
                    ? `${userData.height_cm} cm`
                    : "No especificado"}
                </span>
              </div>
            </div>

            {/* Estilo de Vida */}
            <div className="data-category">
              <div className="category-header">
                <h3 className="category-title">
                  <Activity size={20} />
                  Estilo de Vida
                </h3>
                <button
                  className="category-edit-btn"
                  onClick={() => setShowLifestyleModal(true)}
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="data-item">
                <span className="data-label">Nivel de Actividad</span>
                <span className="data-value">
                  {lifestyleLabels[userData?.lifestyle] || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Preferencia Dietética</span>
                <span className="data-value">
                  {dietLabels[userData?.diet_preference] || "No especificado"}
                </span>
              </div>
            </div>

            {/* Objetivos */}
            <div className="data-category">
              <div className="category-header">
                <h3 className="category-title">
                  <Target size={20} />
                  Objetivos
                </h3>
                <button
                  className="category-edit-btn"
                  onClick={() => setShowGoalsModal(true)}
                >
                  <Edit3 size={18} />
                </button>
              </div>

              <div className="data-item">
                <span className="data-label">Meta Principal</span>
                <span className="data-value">
                  {goalLabels[userData?.main_goal] || "No especificado"}
                </span>
              </div>

              <div className="data-item">
                <span className="data-label">Frecuencia de Comidas</span>
                <span className="data-value">
                  {userData?.meal_frequency
                    ? `${userData.meal_frequency} comidas al día`
                    : "No especificado"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modales de edición específicos */}
      <EditAvatarModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        currentAvatar={userData?.avatar_url}
        onUpdate={handleProfileUpdated}
      />

      <EditPersonalInfoModal
        isOpen={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        currentData={userData}
        onUpdate={handleProfileUpdated}
      />

      <EditPhysicalDataModal
        isOpen={showPhysicalModal}
        onClose={() => setShowPhysicalModal(false)}
        currentData={userData}
        onUpdate={handleProfileUpdated}
      />

      <EditLifestyleModal
        isOpen={showLifestyleModal}
        onClose={() => setShowLifestyleModal(false)}
        currentData={userData}
        onUpdate={handleProfileUpdated}
      />

      <EditGoalsModal
        isOpen={showGoalsModal}
        onClose={() => setShowGoalsModal(false)}
        currentData={userData}
        onUpdate={handleProfileUpdated}
      />
    </div>
  );
};

export default MyData;
