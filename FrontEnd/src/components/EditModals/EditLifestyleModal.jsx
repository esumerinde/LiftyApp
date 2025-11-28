import { useState } from "react";
import { X } from "lucide-react";
import { updateMyProfile } from "../../services/profileService";
import "./EditModals.css";

const EditLifestyleModal = ({ isOpen, onClose, currentData, onUpdate }) => {
  const [formData, setFormData] = useState({
    lifestyle: currentData?.lifestyle || "",
    diet_preference: currentData?.diet_preference || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await updateMyProfile(formData);

    if (result.success) {
      onUpdate(result.data.user);
      onClose();
    } else {
      setError(result.message);
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay" onClick={onClose}>
      <div
        className="edit-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-header">
          <h3 className="edit-modal-title">Estilo de Vida</h3>
          <button className="lifty-back-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="form-group">
            <label className="form-label">Nivel de Actividad</label>
            <select
              name="lifestyle"
              className="form-input"
              value={formData.lifestyle}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="sedentary">Sedentario</option>
              <option value="light">Ligero</option>
              <option value="moderate">Moderado</option>
              <option value="active">Activo</option>
              <option value="very_active">Muy Activo</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Preferencia Dietética</label>
            <select
              name="diet_preference"
              className="form-input"
              value={formData.diet_preference}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="omnivore">Omnívoro</option>
              <option value="vegan">Vegano</option>
              <option value="vegetarian">Vegetariano</option>
              <option value="keto">Keto</option>
              <option value="low_carb">Bajo en Carbohidratos</option>
            </select>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="form-actions">
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLifestyleModal;
