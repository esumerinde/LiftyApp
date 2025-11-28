import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import styles from "./Step3.module.css";
import sedentario1 from "../assets/paso3/F-Sedentario.png";
import sedentario2 from "../assets/paso3/F-Sedentario2.png";
import sedentario3 from "../assets/paso3/F-Sedentario3.png";
import ligero1 from "../assets/paso3/F-Ligero.png";
import ligero2 from "../assets/paso3/F-Ligero2.png";
import moderado1 from "../assets/paso3/F-Moderado.png";
import moderado2 from "../assets/paso3/F-Moderado2.png";
import moderado3 from "../assets/paso3/F-Moderado3.png";
import activo1 from "../assets/paso3/F-Activo.png";
import activo2 from "../assets/paso3/F-Activo2.png";
import activo3 from "../assets/paso3/F-Activo3.png";
import muyActivo1 from "../assets/paso3/F-MuyActivo.png";
import muyActivo2 from "../assets/paso3/F-MuyActivo2.png";
import muyActivo3 from "../assets/paso3/F-MuyActivo3.png";

const LIFESTYLE_OPTIONS = [
  {
    value: "sedentary",
    label: "Sedentario",
    desc: "Trabajo de oficina, poco movimiento",
    images: [sedentario1, sedentario2, sedentario3],
  },
  {
    value: "light",
    label: "Ligero",
    desc: "Camino al trabajo, tareas domésticas",
    images: [ligero1, ligero2],
  },
  {
    value: "moderate",
    label: "Moderado",
    desc: "Ejercicio 1-2 días/semana",
    images: [moderado1, moderado2, moderado3],
  },
  {
    value: "active",
    label: "Activo",
    desc: "Ejercicio 3-4 días/semana",
    images: [activo1, activo2, activo3],
  },
  {
    value: "very_active",
    label: "Muy Activo",
    desc: "Ejercicio 5+ días/semana",
    images: [muyActivo1, muyActivo2, muyActivo3],
  },
];

function Step3({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  // Estado para la imagen actual de cada opción
  const [currentImages, setCurrentImages] = useState([0, 0, 0, 0, 0]);

  // Rotar imágenes para cada opción - TODOS con mismo intervalo de 5000ms
  useEffect(() => {
    const intervals = LIFESTYLE_OPTIONS.map((option, index) => {
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
    if (formData.lifestyle) {
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
  }, [formData.lifestyle]);

  return (
    <div className={styles.formStep}>
      {/* Lluvia de corazones (actividad física) - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Heart
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
            ¡Excelente, {formData.name}!
          </h2>
        </div>

        {/* Frases motivacionales */}
        <div className="motivational-container">
          <p
            key={`mot3-1-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p
            key={`mot3-2-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Pregunta principal */}
        <h3 className={`${styles.subQuestion} text-gradient`}>
          ¿Cómo es tu día a día?
        </h3>

        {/* Layout vertical: imagen -> botón -> imagen -> botón... */}
        {LIFESTYLE_OPTIONS.map((option, index) => (
          <div key={option.value}>
            {/* Imagen con animación igual a Step2 */}
            <div className={styles.imageContainer}>
              <img
                key={`lifestyle-${option.value}-${currentImages[index]}`}
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
                  name="lifestyle"
                  value={option.value}
                  checked={formData.lifestyle === option.value}
                  onChange={(e) => handleChange("lifestyle", e.target.value)}
                />
                <span
                  className={`btn-option ${
                    formData.lifestyle === option.value ? "checked" : ""
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

export default Step3;
