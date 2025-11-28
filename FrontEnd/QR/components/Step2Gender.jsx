import { Dumbbell } from "lucide-react";
import styles from "./Step2.module.css";
import generoImage from "../assets/paso2/F-Genero.png";

function Step2Gender({
  formData,
  handleChange,
  currentMotivational,
  rainDrops,
  MOTIVATIONAL_TEXTS,
  animateStep,
}) {
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
      </div>
    </div>
  );
}

export default Step2Gender;
