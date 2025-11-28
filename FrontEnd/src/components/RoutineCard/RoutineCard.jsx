import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, Target, Bookmark } from "lucide-react";
import "./RoutineCard.css";

const RoutineCard = ({
  routine,
  isSaved = false,
  isSaving = false,
  onToggleSave,
  category = null,
  isOwnRoutine = false,
}) => {
  const { id_routine, name, description, difficulty_level, goal } = routine;

  const exercisesCount = Number(
    routine.exercises_count ??
      routine.total_exercises ??
      routine.exercisesCount ??
      0
  );

  const difficultyLabel = difficulty_level
    ? difficulty_level === "easy"
      ? "Fácil"
      : difficulty_level === "medium"
      ? "Intermedio"
      : difficulty_level === "hard"
      ? "Difícil"
      : difficulty_level
    : null;

  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

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
    navigate(`/routine/${id_routine}`);
  };

  const handleSave = () => {
    if (!onToggleSave || !id_routine) {
      return;
    }

    onToggleSave(routine, isSaved);
  };

  // Determinar badge
  const isLucasRoutine = routine.creator_username === "lucasguerrero";
  const getBadgeInfo = () => {
    if (isOwnRoutine) {
      return { label: "Mi Rutina", className: "own-routine" };
    }
    if (isLucasRoutine) {
      return { label: "Premium", className: "premium" };
    }
    if (category === "trending") {
      return { label: "Tendencia", className: "trending" };
    }
    if (category === "popular") {
      return { label: "Populares", className: "popular" };
    }
    if (category === "recommended") {
      return { label: "Recomendadas", className: "recommended" };
    }
    return null;
  };

  const badgeInfo = getBadgeInfo();

  return (
    <article
      ref={cardRef}
      className={`lifty-diet-card ${isVisible ? "lifty-card-visible" : ""}`}
    >
      {/* Header de la Card */}
      <div className="lifty-diet-card-header">
        <h3 className="lifty-diet-card-title">{name}</h3>
        <div className="lifty-diet-card-badges">
          {badgeInfo && (
            <span className={`lifty-badge-category ${badgeInfo.className}`}>
              {badgeInfo.label}
            </span>
          )}
          {difficultyLabel && (
            <span className={`lifty-badge-difficulty ${difficulty_level}`}>
              {difficultyLabel}
            </span>
          )}
        </div>
      </div>

      {/* Descripción */}
      {description && (
        <p className="lifty-diet-card-description">{description}</p>
      )}

      {/* Info Row */}
      <div className="lifty-diet-card-info-row">
        <div className="lifty-diet-card-info-item">
          <Dumbbell
            className="lifty-diet-card-info-icon"
            size={18}
            strokeWidth={2}
          />
          <span className="lifty-diet-card-info-text">
            {exercisesCount} {exercisesCount === 1 ? "Ejercicio" : "Ejercicios"}
          </span>
        </div>
        {goal && (
          <div className="lifty-diet-card-info-item">
            <Target
              className="lifty-diet-card-info-icon"
              size={18}
              strokeWidth={2}
            />
            <span className="lifty-diet-card-info-text">{goal}</span>
          </div>
        )}
      </div>

      {/* Footer de Acciones */}
      <div className="lifty-diet-card-footer">
        <button
          className="lifty-btn-secondary-dark"
          onClick={handleView}
          aria-label="Ver rutina"
        >
          <Dumbbell size={18} strokeWidth={2} />
          Ver Rutina
        </button>
        <button
          className={`lifty-btn-secondary-dark ${isSaved ? "saved" : ""}`}
          onClick={handleSave}
          aria-label="Guardar rutina"
          disabled={isSaving}
        >
          <Bookmark
            size={18}
            strokeWidth={2}
            fill={isSaved ? "currentColor" : "none"}
          />
          {isSaving ? "..." : isSaved ? "Guardada" : "Guardar"}
        </button>
      </div>
    </article>
  );
};

export default RoutineCard;
