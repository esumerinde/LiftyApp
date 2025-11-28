import React from "react";
import "./ConfirmFinishModal.css";

const ConfirmFinishModal = ({
  incompleteExercises,
  onFinishAnyway,
  onResume,
}) => {
  return (
    <div className="cfm-modal-overlay" onClick={onResume}>
      <div className="cfm-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3 className="cfm-title">
          No has completado todas las series de los siguientes ejercicios:
        </h3>

        <ul className="cfm-incomplete-list">
          {incompleteExercises.map((exercise) => (
            <li key={exercise.id} className="cfm-incomplete-item">
              {exercise.name_exercise ||
                exercise.name ||
                `Ejercicio ${exercise.id}`}
            </li>
          ))}
        </ul>

        <div className="cfm-buttons">
          <button className="cfm-btn cfm-btn-primary" onClick={onFinishAnyway}>
            Finalizar de todas formas
          </button>
          <button className="cfm-btn cfm-btn-secondary" onClick={onResume}>
            Volver al entrenamiento
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmFinishModal;
