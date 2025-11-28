import { Sparkles } from "lucide-react";
import styles from "./Step1.module.css";
import paso1Image from "../assets/paso1/F-Nombre.png";

const MOTIVATIONAL_TEXTS = [
  { line1: "¡Tu mejor versión", line2: "está a un paso de distancia!" },
  { line1: "Cada gran cambio", line2: "empieza con una decisión" },
  { line1: "El momento perfecto", line2: "es ahora" },
  { line1: "Transforma tu vida", line2: "paso a paso" },
];

function Step1({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  animateStep,
}) {
  return (
    <div className={styles.formStep}>
      {/* Lluvia de estrellas/sparkles para registro - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Sparkles
            key={i}
            className="rain-drop"
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Contenido con animación delayed */}
      <div className={`fadeInUp2Delayed ${animateStep ? "visible" : ""}`}>
        {/* Frases motivacionales con gradiente */}
        <div className="motivational-container section-spacing">
          <p key={`mot1-${currentMotivational}`} className="motivational-line">
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p key={`mot2-${currentMotivational}`} className="motivational-line">
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Mascota más grande */}
        <div className="logo-container">
          <img src={paso1Image} alt="FitCompa" className="logo-main" />
        </div>

        {/* Título de la pregunta con gradiente */}
        <div className={styles.stepHeader}>
          <h2 className={`${styles.stepQuestion} text-gradient`}>
            ¿Cómo te llamas?
          </h2>
        </div>

        {/* Input con espaciado */}
        <input
          type="text"
          className={styles.textInput}
          placeholder="Ingresa tu nombre"
          value={formData.name}
          onChange={(e) => {
            // Solo permitir letras, espacios y acentos
            const value = e.target.value.replace(
              /[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g,
              ""
            );
            handleChange("name", value);
          }}
          maxLength={50}
        />
      </div>
    </div>
  );
}

export default Step1;
