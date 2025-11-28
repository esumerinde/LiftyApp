import React, { useState, useEffect } from "react";
import { RotateCcw, X } from "lucide-react";
import "./ResetWorkoutModal.css";

const ResetWorkoutModal = ({ onClose, onConfirm }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canConfirm, setCanConfirm] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanConfirm(true);
    }
  }, [timeLeft]);

  const handleConfirm = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <div className="reset-modal-overlay" onClick={onClose}>
      <div className="reset-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="reset-modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="reset-modal-icon">
          <RotateCcw size={48} />
        </div>

        <h2 className="reset-modal-title">Reiniciar Contador</h2>
        <p className="reset-modal-description">
          ¿Estás seguro de que deseas reiniciar el contador del entrenamiento?
          Esta acción no se puede deshacer y perderás el registro del tiempo actual.
        </p>

        {!canConfirm && (
          <div className="reset-modal-timer">
            <div className="reset-timer-circle">
              <span className="reset-timer-number">{timeLeft}</span>
            </div>
            <p className="reset-timer-text">Espera {timeLeft} segundo{timeLeft !== 1 ? 's' : ''} para continuar</p>
          </div>
        )}

        <div className="reset-modal-actions">
          <button 
            className="reset-btn-cancel" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`reset-btn-confirm ${!canConfirm ? 'disabled' : ''}`}
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            <RotateCcw size={18} />
            Reiniciar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetWorkoutModal;
