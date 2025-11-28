import { useState } from "react";
import { X, Camera } from "lucide-react";
import { updateMyProfile } from "../../services/profileService";
import "./EditModals.css";

const EditAvatarModal = ({ isOpen, onClose, currentAvatar, onUpdate }) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatar || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await updateMyProfile({ avatar_url: avatarUrl });

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
          <h3 className="edit-modal-title">Cambiar Foto de Perfil</h3>
          <button className="lifty-back-btn" onClick={onClose}>
            <X size={24} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-modal-form">
          <div className="avatar-preview-section">
            <img
              src={
                avatarUrl ||
                `https://ui-avatars.com/api/?name=User&background=7882b6&color=fff&size=128`
              }
              alt="Preview"
              className="avatar-preview-image"
            />
          </div>

          <div className="form-group">
            <label className="form-label">URL de la imagen</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://ejemplo.com/imagen.jpg"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
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

export default EditAvatarModal;
