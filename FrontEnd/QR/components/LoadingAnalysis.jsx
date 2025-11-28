import { useState, useEffect, useMemo, memo } from "react";
import {
  Loader2,
  Sparkles,
  BarChart3,
  Flame,
  Utensils,
  Dumbbell,
  Target,
  FileText,
  Rocket,
} from "lucide-react";
import styles from "./LoadingScreen.module.css";
import final1 from "../assets/pasoFinal/F-Final1.png";
import final2 from "../assets/pasoFinal/F-Final2.png";
import final3 from "../assets/pasoFinal/F-Final3.png";
import final4 from "../assets/pasoFinal/F-Final4.png";

const FINAL_IMAGES = [final1, final2, final3, final4];

// Componente memoizado para la lluvia de estrellas
const BackgroundRain = memo(({ rainDrops }) => {
  return (
    <div className="background-rain">
      {rainDrops.map((drop, i) => (
        <Sparkles
          key={`rain-drop-${i}`}
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
  );
});

BackgroundRain.displayName = "BackgroundRain";

const ANALYSIS_MESSAGES = [
  { icon: Sparkles, text: "Analizando todas tus respuestas..." },
  { icon: BarChart3, text: "Calculando tu ingesta calórica ideal..." },
  { icon: Flame, text: "Diseñando tu rutina personalizada..." },
  { icon: Utensils, text: "Creando tu plan de alimentación..." },
  { icon: Dumbbell, text: "Optimizando macronutrientes..." },
  { icon: Target, text: "Ajustando a tus objetivos..." },
  { icon: FileText, text: "Preparando tu informe detallado..." },
  { icon: Rocket, text: "¡Todo listo para tu transformación!" },
];

function LoadingAnalysis({ onAnalysisComplete }) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [currentImage, setCurrentImage] = useState(0);

  const currentMessageData = ANALYSIS_MESSAGES[currentMessage];
  const IconComponent = currentMessageData.icon;

  // Crear lluvia de iconos (igual que en los Steps) - MEMORIZADO
  const rainDrops = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 8,
      delay: -Math.random() * 13,
    }));
  }, []); // Array vacío = solo se crea una vez

  useEffect(() => {
    // Cambiar mensaje cada 1.5 segundos (12 segundos / 8 mensajes)
    setCurrentMessage(0);
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % ANALYSIS_MESSAGES.length);
    }, 1500);

    // Rotar imágenes cada 3 segundos
    const imageInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % FINAL_IMAGES.length);
    }, 3000);

    // Simular carga de 12 segundos (8 mensajes × 1.5s)
    const loadingTimeout = setTimeout(() => {
      onAnalysisComplete();
    }, 12000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(imageInterval);
      clearTimeout(loadingTimeout);
    };
  }, [onAnalysisComplete]);

  return (
    <div
      className={styles.loadingAnalysisWrapper}
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f0f11 0%, #1a1a1e 50%, #16161a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lluvia de estrellas (análisis) - siempre visible */}
      <BackgroundRain rainDrops={rainDrops} />

      <div className={styles.loadingScreen}>
        {/* SVG Gradient Definition */}
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient
              id="spinnerGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="var(--lt-accent-color)" />
              <stop
                offset="100%"
                stopColor="var(--lt-accent-color-ultra-light)"
              />
            </linearGradient>
          </defs>
        </svg>

        <div className={styles.loadingContent}>
          {/* Mascota ARRIBA de las frases */}
          <div className="logo-container section-spacing">
            <img
              key={`final-${currentImage}`}
              src={FINAL_IMAGES[currentImage]}
              alt="FitCompa"
              className="logo-main"
            />
          </div>

          {/* Icono y texto motivacional */}
          <div
            className="motivational-container"
            style={{ marginBottom: "3rem" }}
          >
            {/* Icono en la primera línea */}
            <div
              key={`analysis-icon-${currentMessage}`}
              className={styles.loadingIcon}
            >
              <IconComponent
                size={48}
                strokeWidth={1.5}
                style={{
                  color: "var(--lt-accent-color)",
                }}
              />
            </div>

            {/* Texto en la segunda línea */}
            <p
              key={`analysis-text-${currentMessage}`}
              className={`${styles.loadingText} text-gradient`}
            >
              {currentMessageData.text}
            </p>
          </div>

          {/* Spinner centrado con estilo gradient */}
          <div className={styles.spinnerWrapper}>
            <Loader2 className={styles.spinner} size={120} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoadingAnalysis;
