import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  Edit2,
  UtensilsCrossed,
  Flame,
  Check,
  Trash2,
} from "lucide-react";
import ConfirmDialog from "../ConfirmDialog/ConfirmDialog";
import "./DietCard.css";

const DietCard = ({ diet, onActivate, onDelete }) => {
  const navigate = useNavigate();
  const {
    id_diet,
    name,
    description,
    goal,
    calories_per_day,
    meals_count,
    is_currently_active,
  } = diet;

  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const currentCard = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.05,
        rootMargin: "20px",
      }
    );

    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  const handleView = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/diets/${id_diet}`);
  };

  const handleActivate = (e) => {
    e.stopPropagation();
    if (onActivate) {
      onActivate(id_diet);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setShowDeleteConfirm(false);
    if (onDelete) {
      onDelete(id_diet);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <>
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Eliminar Dieta"
          message={`¿Estás seguro que deseas eliminar la dieta "${name}"? Esta acción no se puede deshacer.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
      <article
        ref={cardRef}
        className={`lifty-diet-card ${isVisible ? "lifty-card-visible" : ""}`}
      >
        {/* Header de la Card */}
        <div className="lifty-diet-card-header">
          <h3 className="lifty-diet-card-title">{name}</h3>
          <span className="lifty-badge-goal">{goal}</span>
        </div>

        {/* Descripción */}
        {description && (
          <p className="lifty-diet-card-description">{description}</p>
        )}

        {/* Info Row */}
        <div className="lifty-diet-card-info-row">
          <div className="lifty-diet-card-info-item">
            <UtensilsCrossed
              className="lifty-diet-card-info-icon"
              size={18}
              strokeWidth={2}
            />
            <span className="lifty-diet-card-info-text">
              {meals_count} {meals_count === 1 ? "Meal" : "Meals"}
            </span>
          </div>
          <div className="lifty-diet-card-info-item">
            <Flame
              className="lifty-diet-card-info-icon"
              size={18}
              strokeWidth={2}
            />
            <span className="lifty-diet-card-info-text">
              {calories_per_day} kcal/day
            </span>
          </div>
        </div>

        {/* Footer de Acciones */}
        <div className="lifty-diet-card-footer">
          <button
            className="lifty-btn-secondary-dark"
            onClick={handleView}
            aria-label="Ver dieta"
          >
            <UtensilsCrossed size={18} strokeWidth={2} />
            Ver Dieta
          </button>
          <button
            className={`lifty-btn-secondary-dark ${
              is_currently_active ? "saved" : ""
            }`}
            onClick={handleActivate}
            aria-label={
              is_currently_active ? "Dieta activada" : "Activar dieta"
            }
            disabled={is_currently_active}
          >
            <Check
              size={18}
              strokeWidth={2}
              fill={is_currently_active ? "currentColor" : "none"}
            />
            {is_currently_active ? "Activada" : "Activar"}
          </button>
        </div>
      </article>
    </>
  );
};

export default DietCard;
