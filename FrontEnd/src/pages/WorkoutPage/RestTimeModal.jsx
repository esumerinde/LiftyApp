import React, { useState } from "react";
import { Timer } from "lucide-react";
import "./WorkoutPageExerciseCard.css";

const RestTimeModal = ({ onClose, onSelectTime, currentTime }) => {
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [tempRestTime, setTempRestTime] = useState(currentTime || 90);
  const [tempRestType, setTempRestType] = useState("working");
  const [isRestEnabled, setIsRestEnabled] = useState(currentTime > 0);

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0
      ? `${mins}:${secs.toString().padStart(2, "0")}m`
      : `${mins}m`;
  };

  const handleTouchStart = (e) => {
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const diff = e.touches[0].clientY - startY;
    if (diff > 0) {
      setCurrentY(diff);
    }
  };

  const handleTouchEnd = () => {
    if (currentY > 100) {
      onClose();
    }
    setIsDragging(false);
    setCurrentY(0);
    setStartY(0);
  };

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setTempRestTime(value);
  };

  const handleConfirm = () => {
    onSelectTime(isRestEnabled ? tempRestTime : 0);
    onClose();
  };

  return (
    <div className="wp-modal-overlay" onClick={onClose}>
      <div
        className="wp-rest-time-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: `translateY(${currentY}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
      >
        <div
          className="wp-modal-drag-handle"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        ></div>
        <h4>Descanso entre series</h4>

        {/* Switch para activar/desactivar descansos */}
        <div className="wp-rest-switch-container">
          <span className="wp-rest-switch-label">Descanso entre series</span>
          <label className="wp-rest-switch">
            <input
              type="checkbox"
              checked={isRestEnabled}
              onChange={(e) => setIsRestEnabled(e.target.checked)}
            />
            <span className="wp-rest-switch-slider"></span>
          </label>
        </div>

        {isRestEnabled && (
          <>
            {/* Selector Warm-Up / Working Sets */}
            <div className="wp-rest-type-selector">
              <button
                className={`wp-rest-type-btn ${
                  tempRestType === "warmup" ? "active" : ""
                }`}
                onClick={() => setTempRestType("warmup")}
              >
                Warm-Up Sets
              </button>
              <button
                className={`wp-rest-type-btn ${
                  tempRestType === "working" ? "active" : ""
                }`}
                onClick={() => setTempRestType("working")}
              >
                Working Sets
              </button>
            </div>

            {/* Display del tiempo seleccionado */}
            <div className="wp-rest-time-display">
              <Timer size={28} />
              <span className="wp-rest-time-value">
                {formatTime(tempRestTime)}
              </span>
            </div>

            {/* Slider interactivo */}
            <div className="wp-rest-slider-container">
              <div className="wp-rest-slider-labels">
                <span>10s</span>
                <span>2:30m</span>
                <span>5m</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={tempRestTime}
                onChange={handleSliderChange}
                className="wp-rest-slider"
              />
              <div className="wp-rest-slider-marks">
                {[10, 30, 60, 90, 120, 150, 180, 240, 300].map((mark) => (
                  <div
                    key={mark}
                    className="wp-rest-slider-mark"
                    style={{ left: `${((mark - 10) / 290) * 100}%` }}
                    onClick={() => setTempRestTime(mark)}
                  >
                    <div className="wp-rest-slider-mark-dot" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sugerencias rápidas */}
            <div className="wp-rest-quick-times">
              {[30, 60, 90, 120, 180].map((time) => (
                <button
                  key={time}
                  className={`wp-rest-quick-btn ${
                    tempRestTime === time ? "active" : ""
                  }`}
                  onClick={() => setTempRestTime(time)}
                >
                  {formatTime(time)}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Botón confirmar */}
        <button
          className="lifty-btn-secondary-dark wp-rest-confirm-btn"
          onClick={handleConfirm}
        >
          {isRestEnabled ? "Confirmar" : "Sin descanso"}
        </button>
      </div>
    </div>
  );
};

export default RestTimeModal;
