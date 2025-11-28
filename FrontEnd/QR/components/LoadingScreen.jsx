import { useState, useEffect, useMemo, memo } from "react";
import {
  Loader2,
  Sparkles,
  User,
  Target,
  FileText,
  Star,
  BarChart3,
  Dna,
  Flame,
  Scale,
  Lightbulb,
  Activity,
  Zap,
  Dumbbell,
  RefreshCw,
  Apple,
  Salad,
  Utensils,
  Leaf,
  Rocket,
  Sparkle,
  Trophy,
} from "lucide-react";
import styles from "./LoadingScreen.module.css";

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

// Mensajes con iconos específicos para cada transición de paso (6 frases x 1.5s = 9 segundos)
const LOADING_MESSAGES_BY_STEP = {
  1: [
    { icon: Sparkles, text: "Guardando tu nombre..." },
    { icon: User, text: "Preparando tu perfil" },
    { icon: Target, text: "Listos para conocerte mejor" },
    { icon: FileText, text: "Creando tu historia" },
    { icon: Star, text: "Iniciando tu transformación" },
    { icon: Rocket, text: "¡Vamos por más!" },
  ],
  2: [
    { icon: BarChart3, text: "Analizando tus datos..." },
    { icon: Dna, text: "Calculando tu metabolismo" },
    { icon: Flame, text: "Procesando información" },
    { icon: Scale, text: "Evaluando tu composición" },
    { icon: Lightbulb, text: "Definiendo tu punto de partida" },
    { icon: Zap, text: "¡Todo calculado!" },
  ],
  3: [
    { icon: Activity, text: "Evaluando tu actividad..." },
    { icon: Zap, text: "Ajustando recomendaciones" },
    { icon: Dumbbell, text: "Personalizando tu plan" },
    { icon: Target, text: "Analizando tu rutina diaria" },
    { icon: RefreshCw, text: "Optimizando tu energía" },
    { icon: Trophy, text: "¡Perfecto!" },
  ],
  4: [
    { icon: Apple, text: "Revisando tu alimentación..." },
    { icon: Salad, text: "Optimizando nutrición" },
    { icon: Sparkles, text: "Creando tu dieta ideal" },
    { icon: Utensils, text: "Diseñando tus comidas" },
    { icon: Leaf, text: "Equilibrando macronutrientes" },
    { icon: Star, text: "¡Nutrición lista!" },
  ],
  5: [
    { icon: Target, text: "Definiendo tus objetivos..." },
    { icon: Rocket, text: "Trazando tu camino" },
    { icon: Sparkle, text: "Tu meta está cerca" },
    { icon: Trophy, text: "Diseñando tu plan de éxito" },
    { icon: Sparkles, text: "Visualizando tu transformación" },
    { icon: Star, text: "¡Todo listo!" },
  ],
};

function LoadingScreen({ currentStep }) {
  const [currentMessage, setCurrentMessage] = useState(0);

  // Crear lluvia de iconos (igual que en los Steps) - MEMORIZADO
  const rainDrops = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 8,
      delay: -Math.random() * 13,
    }));
  }, []); // Array vacío = solo se crea una vez

  // Obtener mensajes según el paso actual
  const messages = LOADING_MESSAGES_BY_STEP[currentStep] || [
    { icon: Sparkles, text: "Procesando..." },
    { icon: Dumbbell, text: "Un momento..." },
    { icon: Target, text: "Casi listo..." },
    { icon: RefreshCw, text: "Preparando..." },
    { icon: Star, text: "Finalizando..." },
    { icon: Rocket, text: "¡Ya casi!" },
  ];

  const currentMessageData = messages[currentMessage];
  const IconComponent = currentMessageData.icon;

  // Rotar mensajes cada 1.5 segundos (9 segundos / 6 mensajes)
  useEffect(() => {
    setCurrentMessage(0); // Reset al cambiar de paso
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 1500);

    return () => clearInterval(messageInterval);
  }, [currentStep, messages.length]);

  return (
    <div className={styles.loadingScreen}>
      {/* Lluvia de estrellas - siempre visible */}
      <BackgroundRain rainDrops={rainDrops} />

      <div className={styles.loadingContent}>
        {/* Icono y texto motivacional ARRIBA del spinner */}
        <div
          className="motivational-container"
          style={{ marginBottom: "3rem" }}
        >
          {/* Icono en la primera línea */}
          <div
            key={`loading-icon-${currentStep}-${currentMessage}`}
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
            key={`loading-text-${currentStep}-${currentMessage}`}
            className={`${styles.loadingText} text-gradient`}
          >
            {currentMessageData.text}
          </p>
        </div>

        {/* Spinner centrado con estilo sólido */}
        <div className={styles.spinnerWrapper}>
          <Loader2 className={styles.spinner} size={120} />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
