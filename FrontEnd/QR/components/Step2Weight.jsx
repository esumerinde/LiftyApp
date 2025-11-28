import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import styles from "./Step2.module.css";
import peso1Image from "../assets/paso2/F-Peso.png";
import peso2Image from "../assets/paso2/F-Peso2.png";

const PESO_IMAGES = [peso1Image, peso2Image];

function Step2Weight({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  const [currentPesoImage, setCurrentPesoImage] = useState(0);

  // Rotar imágenes de peso
  useEffect(() => {
    const pesoInterval = setInterval(() => {
      setCurrentPesoImage((prev) => (prev + 1) % PESO_IMAGES.length);
    }, 5000);
    return () => clearInterval(pesoInterval);
  }, []);

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
            Perfecto, {formData.name}
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
    </div>
  );
}

export default Step2Weight;
