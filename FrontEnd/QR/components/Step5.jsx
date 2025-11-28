import { useState, useEffect } from "react";
import { Target } from "lucide-react";
import styles from "./Step5.module.css";
import ganarMusculo1 from "../assets/paso5/F-GanarMusculo1.png";
import ganarMusculo2 from "../assets/paso5/F-GanarMusculo2.png";
import mantener1 from "../assets/paso5/F-Mantener.png";
import mantener2 from "../assets/paso5/F-Mantener2.png";
import mantener3 from "../assets/paso5/F-Mantener3.png";
import mantener4 from "../assets/paso5/F-Mantener4.png";
import perderPeso1 from "../assets/paso5/F-PerderPeso1.png";
import perderPeso2 from "../assets/paso5/F-PerderPeso2.png";
import perderPeso3 from "../assets/paso5/F-PerderPeso3.png";
import perderPeso4 from "../assets/paso5/F-PerderPeso4.png";
import perderPeso5 from "../assets/paso5/F-PerderPeso5.png";
import tonificar1 from "../assets/paso5/F-Tonificar1.png";
import tonificar2 from "../assets/paso5/F-Tonificar2.png";
import tonificar3 from "../assets/paso5/F-Tonificar3.png";
import tonificar4 from "../assets/paso5/F-Tonificar4.png";

const GOAL_OPTIONS = [
  {
    value: "lose_weight",
    label: "Perder Peso",
    desc: "Quiero reducir mi porcentaje de grasa",
    images: [perderPeso1, perderPeso2, perderPeso3, perderPeso4, perderPeso5],
  },
  {
    value: "gain_muscle",
    label: "Ganar Músculo",
    desc: "Quiero aumentar masa muscular",
    images: [ganarMusculo1, ganarMusculo2],
  },
  {
    value: "get_toned",
    label: "Tonificar y Definir",
    desc: "Quiero marcar y definir mi cuerpo",
    images: [tonificar1, tonificar2, tonificar3, tonificar4],
  },
  {
    value: "maintain",
    label: "Mantenerme Saludable",
    desc: "Quiero mantener mi estado actual",
    images: [mantener1, mantener2, mantener3, mantener4],
  },
];

function Step5({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  // Estado para la imagen actual de cada opción
  const [currentImages, setCurrentImages] = useState([0, 0, 0, 0]);

  // Rotar imágenes para cada opción - TODOS con mismo intervalo de 5000ms
  useEffect(() => {
    const intervals = GOAL_OPTIONS.map((option, index) => {
      return setInterval(() => {
        setCurrentImages((prev) => {
          const newImages = [...prev];
          newImages[index] = (newImages[index] + 1) % option.images.length;
          return newImages;
        });
      }, 5000); // MISMO tiempo que la animación CSS
    });

    return () => intervals.forEach((interval) => clearInterval(interval));
  }, []);

  // Scroll automático cuando se selecciona una opción
  useEffect(() => {
    if (formData.mainGoal) {
      setTimeout(() => {
        const rootElement = document.getElementById("root");
        if (rootElement) {
          rootElement.scrollTo({
            top: rootElement.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  }, [formData.mainGoal]);

  return (
    <div className={styles.formStep}>
      {/* Lluvia de targets - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Target
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
        <div className={styles.stepHeader}>
          <h2 className={`${styles.stepQuestion} text-gradient`}>
            ¡Ya casi llegamos, {formData.name}!
          </h2>
        </div>

        {/* Frases motivacionales */}
        <div className="motivational-container">
          <p
            key={`mot5-1-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p
            key={`mot5-2-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Pregunta principal */}
        <h3 className={`${styles.subQuestion} text-gradient`}>
          ¿Cuál es tu meta principal?
        </h3>

        {/* Layout vertical: imagen -> botón -> imagen -> botón... */}
        {GOAL_OPTIONS.map((option, index) => (
          <div key={option.value}>
            {/* Imagen con animación igual a Step2 */}
            <div className={styles.imageContainer}>
              <img
                key={`goal-${option.value}-${currentImages[index]}`}
                src={option.images[currentImages[index]]}
                alt={option.label}
                className={styles.rotatingImage}
              />
            </div>

            {/* Botón centrado */}
            <div className={styles.fieldGroup}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="mainGoal"
                  value={option.value}
                  checked={formData.mainGoal === option.value}
                  onChange={(e) => handleChange("mainGoal", e.target.value)}
                />
                <span
                  className={`btn-option ${
                    formData.mainGoal === option.value ? "checked" : ""
                  }`}
                >
                  <div className={styles.optionContent}>
                    <strong>{option.label}</strong>
                    <span className={styles.optionDesc}>{option.desc}</span>
                  </div>
                </span>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Step5;
