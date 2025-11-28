import { useState, useEffect, useMemo } from "react";
import { Dumbbell, Sparkles } from "lucide-react";
import styles from "./WelcomeScreen.module.css";
import liftyLogo from "../assets/LogoLiftyFull.png";

const MOTIVATIONAL_TEXTS = [
  { line1: "¡Tu mejor versión", line2: "está a un paso de distancia!" },
  { line1: "Cada gran cambio", line2: "empieza con una decisión" },
  { line1: "El momento perfecto", line2: "es ahora" },
  { line1: "Transforma tu vida", line2: "paso a paso" },
];

function WelcomeScreen({ onStart }) {
  const [currentMotivational, setCurrentMotivational] = useState(0);

  // Memorizar la lluvia para que no se recree en cada render
  const dumbbellRain = useMemo(() => {
    return [...Array(25)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 5 + Math.random() * 8,
      delay: -Math.random() * 13, // Delay negativo para que empiecen dispersas
    }));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMotivational((prev) => (prev + 1) % MOTIVATIONAL_TEXTS.length);
    }, 5000); // 5 segundos sin sincronización con animación

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.welcomeContainer}>
      {/* Fondo animado con lluvia de mancuernas */}
      <div className="background-rain">
        {dumbbellRain.map((drop) => (
          <Dumbbell
            key={drop.id}
            className="rain-drop-fade"
            style={{
              left: `${drop.left}%`,
              animationDuration: `${drop.duration}s`,
              animationDelay: `${drop.delay}s`,
              opacity: 0.7,
            }}
          />
        ))}
      </div>

      {/* Contenido central */}
      <div className={styles.contentBox}>
        {/* Texto de bienvenida */}
        <h1 className="welcome-title">¡Me alegro de verte!</h1>
        <p className="welcome-subtitle text-gradient">
          ¿Estás listo para dar el primer paso hacia tu mejor versión?
        </p>

        {/* Logo grande */}
        <div className="logo-container">
          <img src={liftyLogo} alt="Lifty" className="logo-main" />
        </div>

        {/* Frases motivacionales rotativas con espaciado */}
        <div className="motivational-container motivational-spacing">
          <p key={`line1-${currentMotivational}`} className="motivational-line">
            {MOTIVATIONAL_TEXTS[currentMotivational].line1}
          </p>
          <p key={`line2-${currentMotivational}`} className="motivational-line">
            {MOTIVATIONAL_TEXTS[currentMotivational].line2}
          </p>
        </div>

        <button className="btn-primary" onClick={onStart}>
          <Sparkles size={20} />
          ¡Comenzar mi Transformación!
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
