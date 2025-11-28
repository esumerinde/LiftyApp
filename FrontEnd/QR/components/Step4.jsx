import { useState, useEffect } from "react";
import { Apple } from "lucide-react";
import styles from "./Step4.module.css";
import deTodo1 from "../assets/paso4/F-DeTodo1.png";
import deTodo2 from "../assets/paso4/F-DeTodo2.png";
import deTodo3 from "../assets/paso4/F-DeTodo3.png";
import vegana1 from "../assets/paso4/F-Vegana1.png";
import vegana2 from "../assets/paso4/F-Vegana2.png";
import vegana3 from "../assets/paso4/F-Vegana3.png";
import vegana4 from "../assets/paso4/F-Vegana4.png";
import bajo1 from "../assets/paso4/F-Bajo1.png";
import bajo2 from "../assets/paso4/F-Bajo2.png";
import bajo3 from "../assets/paso4/F-Bajo3.png";
import bajo4 from "../assets/paso4/F-Bajo4.png";

const DIET_OPTIONS = [
  {
    value: "omnivore",
    label: "Como de todo",
    desc: "Sin restricciones alimentarias",
    images: [deTodo1, deTodo2, deTodo3],
  },
  {
    value: "vegan",
    label: "Vegana",
    desc: "Sin productos de origen animal",
    images: [vegana1, vegana2, vegana3, vegana4],
  },
  {
    value: "low_carb",
    label: "Baja en carbohidratos",
    desc: "Reducción de harinas y azúcares",
    images: [bajo1, bajo2, bajo3, bajo4],
  },
];

function Step4({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  // Estado para la imagen actual de cada opción
  const [currentImages, setCurrentImages] = useState([0, 0, 0]);

  // Rotar imágenes para cada opción - TODOS con mismo intervalo de 5000ms
  useEffect(() => {
    const intervals = DIET_OPTIONS.map((option, index) => {
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
    if (formData.diet) {
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
  }, [formData.diet]);

  return (
    <div className={styles.formStep}>
      {/* Lluvia de manzanas - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Apple
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
            ¡Vamos bien, {formData.name}!
          </h2>
        </div>

        {/* Frases motivacionales */}
        <div className="motivational-container">
          <p
            key={`mot4-1-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p
            key={`mot4-2-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Pregunta principal */}
        <h3 className={`${styles.subQuestion} text-gradient`}>
          ¿Cómo sueles comer?
        </h3>

        {/* Layout vertical: imagen -> botón -> imagen -> botón... */}
        {DIET_OPTIONS.map((option, index) => (
          <div key={option.value}>
            {/* Imagen con animación igual a Step2 */}
            <div className={styles.imageContainer}>
              <img
                key={`diet-${option.value}-${currentImages[index]}`}
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
                  name="diet"
                  value={option.value}
                  checked={formData.diet === option.value}
                  onChange={(e) => handleChange("diet", e.target.value)}
                />
                <span
                  className={`btn-option ${
                    formData.diet === option.value ? "checked" : ""
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

export default Step4;
