import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  ChevronRight,
  Target,
  Brain,
  TrendingUp,
  Eye,
  Clock,
} from "lucide-react";
import "./AIRoutineWelcomeModal.css";

const AIRoutineWelcomeModal = ({ routineId, routineName, onClose }) => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animación de entrada
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  };

  const handleViewRoutine = () => {
    setIsVisible(false);
    setTimeout(() => {
      navigate(`/routine/${routineId}`);
      onClose();
    }, 300);
  };

  return (
    <div className={`ai-modal-overlay ${isVisible ? "visible" : ""}`}>
      <div className={`ai-modal-container ${isVisible ? "visible" : ""}`}>
        {/* Botón cerrar */}
        <button className="ai-modal-close" onClick={handleClose}>
          <X size={20} />
        </button>

        {/* Banner de la rutina */}
        <div className="ai-modal-banner">
          <img
            src="https://i.imgur.com/nCP1kny.png"
            alt="AI Generated Routine"
            className="ai-modal-banner-image"
          />
        </div>

        {/* Título estilo Hub de Entrenamiento */}
        <h2 className="ai-modal-title-hub">
          ¡TU PLAN DE ENTRENAMIENTO ESTÁ LISTO!
        </h2>

        {/* Contenido */}
        <div className="ai-modal-content">
          {" "}
          <h3 className="ai-modal-routine-name">
            {routineName || "Tu Rutina Personalizada"}
          </h3>
          <p className="ai-modal-description">
            Hemos creado un <strong>plan de entrenamiento único</strong>{" "}
            diseñado específicamente para ti, basándonos en tus objetivos, nivel
            de experiencia y preferencias.
          </p>
          <div className="ai-modal-features">
            <div className="ai-modal-feature">
              <Target size={20} className="ai-modal-feature-icon" />
              <div className="ai-modal-feature-text">
                <strong>100% Personalizado</strong>
                <span>Adaptado a tus necesidades</span>
              </div>
            </div>
            <div className="ai-modal-feature">
              <Brain size={20} className="ai-modal-feature-icon" />
              <div className="ai-modal-feature-text">
                <strong>Con IA Avanzada</strong>
                <span>Selección inteligente de ejercicios</span>
              </div>
            </div>
            <div className="ai-modal-feature">
              <TrendingUp size={20} className="ai-modal-feature-icon" />
              <div className="ai-modal-feature-text">
                <strong>Resultados Garantizados</strong>
                <span>Optimizado para tu objetivo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="ai-modal-actions">
          <button className="ai-modal-btn-primary" onClick={handleViewRoutine}>
            <Eye size={18} />
            <span>Ver Mi Rutina</span>
          </button>
          <button className="ai-modal-btn-secondary" onClick={handleClose}>
            <Clock size={18} />
            <span>Ver más tarde</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIRoutineWelcomeModal;
