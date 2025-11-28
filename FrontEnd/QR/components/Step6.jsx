import { useState, useEffect } from "react";
import { Utensils } from "lucide-react";
import styles from "./Step6.module.css";
import cuatro1 from "../assets/paso6/F-cuatro1.png";
import cuatro2 from "../assets/paso6/F-cuatro2.png";
import cuatro3 from "../assets/paso6/F-cuatro3.png";
import cuatro4 from "../assets/paso6/F-cuatro4.png";
import cuatro5 from "../assets/paso6/F-cuatro5.png";
import cuatro6 from "../assets/paso6/F-cuatro6.png";
import seis1 from "../assets/paso6/F-seis1.png";
import seis2 from "../assets/paso6/F-seis2.png";
import seis3 from "../assets/paso6/F-seis3.png";
import seis4 from "../assets/paso6/F-seis4.png";
import seis5 from "../assets/paso6/F-seis5.png";
import seis6 from "../assets/paso6/F-seis6.png";

const MEAL_OPTIONS = [
  {
    value: "4",
    label: "4 comidas al día",
    desc: "Desayuno, Almuerzo, Merienda, Cena",
    images: [cuatro1, cuatro2, cuatro3, cuatro4, cuatro5, cuatro6],
  },
  {
    value: "6",
    label: "6 comidas al día",
    desc: "Incluye colaciones entre comidas",
    images: [seis1, seis2, seis3, seis4, seis5, seis6],
  },
];

function Step6({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  // Estado para la imagen actual de cada opción
  const [currentImages, setCurrentImages] = useState([0, 0]);

  // Rotar imágenes para cada opción - TODOS con mismo intervalo de 5000ms
  useEffect(() => {
    const intervals = MEAL_OPTIONS.map((option, index) => {
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
    if (formData.mealFrequency) {
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
  }, [formData.mealFrequency]);

  return (
    <div className={styles.formStep}>
      {/* Lluvia de tenedores - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Utensils
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
            ¡Último paso, {formData.name}!
          </h2>
        </div>

        {/* Frases motivacionales */}
        <div className="motivational-container">
          <p
            key={`mot6-1-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p
            key={`mot6-2-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Pregunta principal */}
        <h3 className={`${styles.subQuestion} text-gradient`}>
          ¿Cuántas comidas prefieres al día?
        </h3>

        {/* Layout vertical: imagen -> botón -> imagen -> botón... */}
        {MEAL_OPTIONS.map((option, index) => (
          <div key={option.value}>
            {/* Imagen con animación igual a Step2 */}
            <div className={styles.imageContainer}>
              <img
                key={`meal-${option.value}-${currentImages[index]}`}
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
                  name="mealFrequency"
                  value={option.value}
                  checked={formData.mealFrequency === option.value}
                  onChange={(e) =>
                    handleChange("mealFrequency", e.target.value)
                  }
                />
                <span
                  className={`btn-option ${
                    formData.mealFrequency === option.value ? "checked" : ""
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

export default Step6;
