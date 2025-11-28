// components/EditProfileModal/EditProfileModal.jsx
import { useState, useEffect } from "react";
import { X, Upload, Camera, Eye, EyeOff, ChevronLeft } from "lucide-react";
import {
  updateMyProfile,
  checkUsernameAvailability,
} from "../../services/profileService";
import "./EditProfileModal.css";

const EditProfileModal = ({
  isOpen,
  onClose,
  currentProfile,
  onProfileUpdated,
}) => {
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    bio: "",
    avatar_url: "",
    gender: "",
    weight: "",
    height: "",
    lifestyle: "",
    diet_preference: "",
    main_goal: "",
    meal_frequency: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    if (currentProfile) {
      setFormData({
        full_name: currentProfile.full_name || "",
        username: currentProfile.username || "",
        email: currentProfile.email || "",
        password: "", // No mostrar password actual
        bio: currentProfile.bio || "",
        avatar_url: currentProfile.avatar_url || "",
        gender: currentProfile.gender || "",
        weight: currentProfile.current_weight_kg || "",
        height: currentProfile.height_cm || "",
        lifestyle: currentProfile.lifestyle || "",
        diet_preference: currentProfile.diet_preference || "",
        main_goal: currentProfile.main_goal || "",
        meal_frequency: currentProfile.meal_frequency || "",
      });
      setImagePreview(currentProfile.avatar_url || "");
    }
  }, [currentProfile]);

  // Debounce para verificar username
  useEffect(() => {
    if (!formData.username || formData.username === currentProfile?.username) {
      setUsernameError("");
      return;
    }

    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      const result = await checkUsernameAvailability(formData.username);
      if (result.success && !result.available) {
        setUsernameError("El nombre de usuario ya está en uso");
      } else {
        setUsernameError("");
      }
      setUsernameChecking(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.username, currentProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si cambia el avatar_url, actualizar preview
    if (name === "avatar_url") {
      setImagePreview(value);
      setImageLoadError(false);
    }
  };

  const handleClearAvatarUrl = () => {
    setFormData((prev) => ({
      ...prev,
      avatar_url: "",
    }));
    setImagePreview("");
    setImageLoadError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (usernameError) {
      return;
    }

    setIsSubmitting(true);
    setGeneralError("");

    const result = await updateMyProfile(formData);

    if (result.success) {
      onProfileUpdated(result.data.user);
      onClose();
    } else {
      setGeneralError(result.message);
    }

    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">EDITAR PERFIL</h2>
          <button className="lifty-back-btn modal-close-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Avatar */}
          <div className="form-group">
            <label className="form-label">Foto de Perfil</label>
            <div className="avatar-upload-container">
              <div className="avatar-preview">
                {imagePreview && !imageLoadError ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="avatar-image"
                    onLoad={() => setImageLoadError(false)}
                    onError={() => setImageLoadError(true)}
                  />
                ) : imagePreview && imageLoadError ? (
                  <div className="avatar-error">
                    <div className="avatar-error-x">✖</div>
                    <div className="avatar-error-text">No disponible</div>
                  </div>
                ) : (
                  <img
                    src={`https://ui-avatars.com/api/?name=${
                      currentProfile?.full_name || "User"
                    }&background=7882b6&color=fff&size=128`}
                    alt="Avatar por defecto"
                    className="avatar-image"
                  />
                )}
              </div>
              <div className="avatar-input-wrapper">
                <div className="avatar-input-row">
                  <input
                    type="url"
                    name="avatar_url"
                    className="form-input"
                    placeholder="URL de la imagen"
                    value={formData.avatar_url}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="clear-avatar-btn"
                    onClick={handleClearAvatarUrl}
                    disabled={!formData.avatar_url}
                    title="Eliminar URL"
                  >
                    Eliminar
                  </button>
                </div>
                <p className="form-hint">Ingresa la URL de tu foto de perfil</p>
              </div>
            </div>
          </div>

          {/* Nombre Completo */}
          <div className="form-group">
            <label className="form-label" htmlFor="full_name">
              Nombre Completo
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              className="form-input"
              placeholder="Ej: Juan Pérez"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="username"
              name="username"
              className={`form-input ${usernameError ? "input-error" : ""}`}
              placeholder="Ej: @juanperez"
              value={formData.username}
              onChange={handleChange}
              required
            />
            {usernameChecking && (
              <p className="form-hint">Verificando disponibilidad...</p>
            )}
            {usernameError && <p className="form-error">{usernameError}</p>}
          </div>

          {/* Biografía */}
          <div className="form-group">
            <label className="form-label" htmlFor="bio">
              Biografía
            </label>
            <textarea
              id="bio"
              name="bio"
              className="form-textarea"
              placeholder="Cuéntanos sobre ti..."
              value={formData.bio}
              onChange={handleChange}
              rows={4}
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="email@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña (dejar vacío para no cambiar)
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                className="form-input"
                placeholder="Nueva contraseña"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--lt-text-secondary)",
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Género */}
          <div className="form-group">
            <label className="form-label" htmlFor="gender">
              Género
            </label>
            <select
              id="gender"
              name="gender"
              className="form-input"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Seleccionar género</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>

          {/* Peso */}
          <div className="form-group">
            <label className="form-label" htmlFor="weight">
              Peso (kg)
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              className="form-input"
              placeholder="70"
              value={formData.weight}
              onChange={handleChange}
              min="20"
              max="300"
              step="0.1"
            />
          </div>

          {/* Altura */}
          <div className="form-group">
            <label className="form-label" htmlFor="height">
              Altura (cm)
            </label>
            <input
              type="number"
              id="height"
              name="height"
              className="form-input"
              placeholder="170"
              value={formData.height}
              onChange={handleChange}
              min="100"
              max="250"
            />
          </div>

          {/* Estilo de Vida */}
          <div className="form-group">
            <label className="form-label" htmlFor="lifestyle">
              Estilo de Vida
            </label>
            <select
              id="lifestyle"
              name="lifestyle"
              className="form-input"
              value={formData.lifestyle}
              onChange={handleChange}
            >
              <option value="">Seleccionar estilo de vida</option>
              <option value="sedentary">Sedentario</option>
              <option value="light">Ligero</option>
              <option value="moderate">Moderado</option>
              <option value="active">Activo</option>
              <option value="very_active">Muy Activo</option>
            </select>
          </div>

          {/* Preferencia Dietética */}
          <div className="form-group">
            <label className="form-label" htmlFor="diet_preference">
              Preferencia Dietética
            </label>
            <select
              id="diet_preference"
              name="diet_preference"
              className="form-input"
              value={formData.diet_preference}
              onChange={handleChange}
            >
              <option value="">Seleccionar dieta</option>
              <option value="omnivore">Omnívoro</option>
              <option value="vegan">Vegano</option>
              <option value="low_carb">Bajo en Carbohidratos</option>
            </select>
          </div>

          {/* Meta Principal */}
          <div className="form-group">
            <label className="form-label" htmlFor="main_goal">
              Meta Principal
            </label>
            <select
              id="main_goal"
              name="main_goal"
              className="form-input"
              value={formData.main_goal}
              onChange={handleChange}
            >
              <option value="">Seleccionar meta</option>
              <option value="lose_weight">Perder Peso</option>
              <option value="gain_muscle">Ganar Músculo</option>
              <option value="get_toned">Tonificar y Definir</option>
              <option value="maintain">Mantenerme Saludable</option>
            </select>
          </div>

          {/* Frecuencia de Comidas */}
          <div className="form-group">
            <label className="form-label" htmlFor="meal_frequency">
              Frecuencia de Comidas
            </label>
            <select
              id="meal_frequency"
              name="meal_frequency"
              className="form-input"
              value={formData.meal_frequency}
              onChange={handleChange}
            >
              <option value="">Seleccionar frecuencia</option>
              <option value="4">4 comidas al día</option>
              <option value="6">6 comidas al día</option>
            </select>
          </div>

          {/* Error General */}
          {generalError && <div className="form-error-box">{generalError}</div>}

          {/* Botones */}
          <div className="modal-actions">
            <button
              type="button"
              className="lifty-btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="lifty-btn-primary"
              disabled={isSubmitting || usernameError || usernameChecking}
            >
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
