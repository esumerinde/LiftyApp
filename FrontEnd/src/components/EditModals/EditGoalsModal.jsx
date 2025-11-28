import { useState } from "react";
import { X } from "lucide-react";
import { updateMyProfile } from "../../services/profileService";
import "./EditModals.css";

const EditGoalsModal = ({ isOpen, onClose, currentData, onUpdate }) => {
  const [formData, setFormData] = useState({
    main_goal: currentData?.main_goal || "",
    meal_frequency: currentData?.meal_frequency || "",
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
          <h3 className="edit-modal-title">Objetivos</h3>
          <button className="lifty-back-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="form-group">
            <label className="form-label">Meta Principal</label>
            <select
              name="main_goal"
              className="form-input"
              value={formData.main_goal}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="lose_weight">Perder Peso</option>
              <option value="gain_muscle">Ganar Músculo</option>
              <option value="get_toned">Tonificar y Definir</option>
              <option value="maintain">Mantenerme Saludable</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Frecuencia de Comidas</label>
            <select
              name="meal_frequency"
              className="form-input"
              value={formData.meal_frequency}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="4">4 comidas al día</option>
              <option value="6">6 comidas al día</option>
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

export default EditGoalsModal;
