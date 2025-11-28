import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import "./RoutineForm.css";

const RoutineForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "",
    difficulty_level: "medium",
    is_public: true,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Limpiar error del campo al editar
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    }

    if (!formData.goal.trim()) {
      newErrors.goal = "El objetivo es obligatorio";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // TODO: Llamar al backend para crear la rutina
      console.log("Crear rutina:", formData);

      // Por ahora, solo navegar de vuelta
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate("/routines");
    } catch (error) {
      console.error("Error al crear rutina:", error);
      window.alert("Hubo un error al crear la rutina");
    }
  };

  const handleCancel = () => {
    if (
      window.confirm(
        "¿Seguro que quieres cancelar? Los cambios no se guardarán."
      )
    ) {
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate("/routines");
    }
  };

  return (
    <div className="routine-form-page page-wrapper">
      <div className="routine-form-container">
        {/* Header */}
        <header className="routine-form-header">
          <button
            className="back-btn"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              navigate("/routines");
            }}
            aria-label="Volver"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <h1 className="routine-form-title">Nueva Rutina</h1>
        </header>

        {/* Formulario */}
        <form className="routine-form" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nombre de la Rutina *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={`form-input ${errors.name ? "error" : ""}`}
              placeholder="Ej: Full Body A, Push Day, Piernas..."
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Descripción *
            </label>
            <textarea
              id="description"
              name="description"
              className={`form-textarea ${errors.description ? "error" : ""}`}
              placeholder="Describe en qué consiste esta rutina..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
            />
            {errors.description && (
              <span className="form-error">{errors.description}</span>
            )}
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          {/* Objetivo */}
          <div className="form-group">
            <label htmlFor="goal" className="form-label">
              Objetivo *
            </label>
            <input
              type="text"
              id="goal"
              name="goal"
              className={`form-input ${errors.goal ? "error" : ""}`}
              placeholder="Ej: Hipertrofia, Fuerza, Resistencia..."
              value={formData.goal}
              onChange={handleChange}
              maxLength={50}
            />
            {errors.goal && <span className="form-error">{errors.goal}</span>}
          </div>

          {/* Dificultad */}
          <div className="form-group">
            <label htmlFor="difficulty_level" className="form-label">
              Dificultad
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              className="form-select"
              value={formData.difficulty_level}
              onChange={handleChange}
            >
              <option value="easy">Fácil</option>
              <option value="medium">Media</option>
              <option value="hard">Difícil</option>
            </select>
          </div>

          {/* Visibilidad */}
          <div className="form-group">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="is_public"
                className="form-checkbox"
                checked={formData.is_public}
                onChange={handleChange}
              />
              <span className="checkbox-text">Hacer pública esta rutina</span>
            </label>
            <p className="form-hint">
              Las rutinas públicas pueden ser vistas y usadas por otros usuarios
            </p>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button
              type="button"
              className="lifty-btn-secondary form-btn-cancel"
              onClick={handleCancel}
            >
              <X size={20} strokeWidth={2} />
              Cancelar
            </button>
            <button type="submit" className="lifty-btn-primary form-btn-submit">
              <Save size={20} strokeWidth={2} />
              Guardar Rutina
            </button>
          </div>
        </form>

        {/* Nota informativa */}
        <div className="form-info-box">
          <p className="form-info-text">
            💡 <strong>Próximo paso:</strong> Después de crear la rutina, podrás
            agregar ejercicios con series, repeticiones y tiempos de descanso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoutineForm;
