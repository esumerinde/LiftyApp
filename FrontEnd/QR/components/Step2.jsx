import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import styles from "./Step2.module.css";
import generoImage from "../assets/paso2/F-Genero.png";
import peso1Image from "../assets/paso2/F-Peso.png";
import peso2Image from "../assets/paso2/F-Peso2.png";
import altura1Image from "../assets/paso2/F-Altura.png";
import altura2Image from "../assets/paso2/F-Altura2.png";

const MOTIVATIONAL_TEXTS = [
  { line1: "Cada dato cuenta", line2: "para diseñar tu plan perfecto" },
  { line1: "Tu cuerpo es único", line2: "tu plan también lo será" },
  { line1: "Conocerte es el primer paso", line2: "hacia el cambio" },
  { line1: "La información correcta", line2: "es poder real" },
];

const PESO_IMAGES = [peso1Image, peso2Image];
const ALTURA_IMAGES = [altura1Image, altura2Image];

function Step2({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  const [currentPesoImage, setCurrentPesoImage] = useState(0);
  const [currentAlturaImage, setCurrentAlturaImage] = useState(0);

  // Rotar imágenes de peso
  useEffect(() => {
    const pesoInterval = setInterval(() => {
      setCurrentPesoImage((prev) => (prev + 1) % PESO_IMAGES.length);
    }, 5000);
    return () => clearInterval(pesoInterval);
  }, []);

  // Rotar imágenes de altura
  useEffect(() => {
    const alturaInterval = setInterval(() => {
      setCurrentAlturaImage((prev) => (prev + 1) % ALTURA_IMAGES.length);
    }, 5000);
    return () => clearInterval(alturaInterval);
  }, []);

  // Scroll suave cuando se selecciona género
  useEffect(() => {
    if (formData.gender && !formData.weight) {
      setTimeout(() => {
        const element = document.querySelector('[data-section="peso"]');
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [formData.gender]);

  // Scroll suave cuando aparece la sección de altura
  useEffect(() => {
    if (formData.gender && formData.weight && !formData.height) {
      const timeoutId = setTimeout(() => {
        const element = document.querySelector('[data-section="altura"]');
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [formData.weight]);

  return (
    <div className={styles.formStep}>
      {/* Lluvia de pesas - siempre visible */}
      <div className="background-rain">
        {rainDrops.map((drop, i) => (
          <Dumbbell
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
            ¡Genial, {formData.name}!
          </h2>
          <h2 className={`${styles.stepQuestion} text-gradient`}>
            ¡Ahora contanos sobre vos!
          </h2>
        </div>

        {/* Frases motivacionales */}
        <div className="motivational-container">
          <p
            key={`mot2-1-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p
            key={`mot2-2-${currentMotivational}`}
            className="motivational-line"
          >
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        {/* Género */}
        <h3 className={`${styles.subQuestion} text-gradient`}>
          ¿Cuál es tu género?
        </h3>

        <div className="logo-container">
          <img src={generoImage} alt="Género" className="logo-main" />
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.radioGroupInline}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={formData.gender === "male"}
                onChange={(e) => handleChange("gender", e.target.value)}
              />
              <span
                className={`btn-option ${
                  formData.gender === "male" ? "checked" : ""
                }`}
              >
                Masculino
              </span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={formData.gender === "female"}
                onChange={(e) => handleChange("gender", e.target.value)}
              />
              <span
                className={`btn-option ${
                  formData.gender === "female" ? "checked" : ""
                }`}
              >
                Femenino
              </span>
            </label>
          </div>
        </div>

        {/* Mostrar sección de Peso solo si se seleccionó género */}
        {formData.gender && (
          <div data-section="peso">
            {/* Espaciado grande para separar secciones */}
            <div style={{ height: "8rem" }} />

            {/* Peso */}
            <h3 className={`${styles.subQuestion} text-gradient`}>
              ¿Cuánto pesas?
            </h3>

            <div className={styles.imageContainer}>
              <img
                key={`peso-${currentPesoImage}`}
                src={PESO_IMAGES[currentPesoImage]}
                alt="Peso"
                className={styles.rotatingImage}
              />
            </div>

            <div className={styles.fieldGroup}>
              <input
                type="number"
                className={styles.numberInput}
                placeholder="Ingresa tu peso en kg"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                min="20"
                max="300"
                step="0.1"
              />
            </div>
          </div>
        )}

        {/* Mostrar sección de Altura solo si se ingresó peso */}
        {formData.gender && formData.weight && (
          <div data-section="altura">
            {/* Espaciado grande para separar secciones */}
            <div style={{ height: "8rem" }} />

            {/* Altura */}
            <h3 className={`${styles.subQuestion} text-gradient`}>
              ¿Cuál es tu altura?
            </h3>

            <div className={styles.imageContainer}>
              <img
                key={`altura-${currentAlturaImage}`}
                src={ALTURA_IMAGES[currentAlturaImage]}
                alt="Altura"
                className={styles.rotatingImage}
              />
            </div>

            <div className={styles.fieldGroup}>
              <input
                type="number"
                className={styles.numberInput}
                placeholder="Ingresa tu altura en cm"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                min="100"
                max="250"
                step="0.1"
              />
            </div>
          </div>
        )}

        {/* Espaciado al final para que los botones sean visibles */}
        {formData.gender && formData.weight && formData.height && (
          <div style={{ height: "6rem" }} />
        )}
      </div>
    </div>
  );
}

export default Step2;
