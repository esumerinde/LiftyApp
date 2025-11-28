import { useState, useEffect } from "react";
import { Dumbbell } from "lucide-react";
import styles from "./Step2.module.css";
import altura1Image from "../assets/paso2/F-Altura.png";
import altura2Image from "../assets/paso2/F-Altura2.png";

const ALTURA_IMAGES = [altura1Image, altura2Image];

function Step2Height({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
  const [currentAlturaImage, setCurrentAlturaImage] = useState(0);

  // Rotar imágenes de altura
  useEffect(() => {
    const alturaInterval = setInterval(() => {
      setCurrentAlturaImage((prev) => (prev + 1) % ALTURA_IMAGES.length);
    }, 5000);
    return () => clearInterval(alturaInterval);
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
            ¡Vamos bien, {formData.name}!
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
    </div>
  );
}

export default Step2Height;
