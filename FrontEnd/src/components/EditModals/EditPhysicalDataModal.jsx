import { useState } from "react";
import { X } from "lucide-react";
import { updateMyProfile } from "../../services/profileService";
import "./EditModals.css";

const EditPhysicalDataModal = ({ isOpen, onClose, currentData, onUpdate }) => {
  const [formData, setFormData] = useState({
    gender: currentData?.gender || "",
    weight: currentData?.current_weight_kg || "",
    height: currentData?.height_cm || "",
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
          <h3 className="edit-modal-title">Datos Físicos</h3>
          <button className="lifty-back-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="form-group">
            <label className="form-label">Género</label>
            <select
              name="gender"
              className="form-input"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">Seleccionar</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Peso (kg)</label>
            <input
              type="number"
              name="weight"
              className="form-input"
              value={formData.weight}
              onChange={handleChange}
              min="1"
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Altura (cm)</label>
            <input
              type="number"
              name="height"
              className="form-input"
              value={formData.height}
              onChange={handleChange}
              min="1"
            />
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

export default EditPhysicalDataModal;
