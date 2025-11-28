import { useState } from "react";
import { X } from "lucide-react";
import { updateMyProfile } from "../../services/profileService";
import "./EditModals.css";

const EditPersonalInfoModal = ({ isOpen, onClose, currentData, onUpdate }) => {
  const [formData, setFormData] = useState({
    full_name: currentData?.full_name || "",
    username: currentData?.username || "",
    email: currentData?.email || "",
    bio: currentData?.bio || "",
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
          <h3 className="edit-modal-title">Información Personal</h3>
          <button className="lifty-back-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="form-group">
            <label className="form-label">Nombre Completo</label>
            <input
              type="text"
              name="full_name"
              className="form-input"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Nombre de Usuario</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Biografía</label>
            <textarea
              name="bio"
              className="form-textarea"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              rows="4"
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

export default EditPersonalInfoModal;
