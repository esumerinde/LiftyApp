import { useState, useEffect, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  Target,
  Activity,
  UtensilsCrossed,
  Calendar,
  Heart,
  Zap,
  Moon,
  Apple,
  Rocket,
} from "lucide-react";
import styles from "./RecommendationScreen.module.css";
import liftyLogo from "../assets/LogoLiftyFull.png";

// Componente memoizado para la lluvia de corazones
const BackgroundRain = memo(({ rainDrops }) => {
  return (
    <div className="background-rain">
      {rainDrops.map((drop, i) => (
        <Heart
          key={`rain-drop-${i}`}
          className="rain-drop-fade"
          style={{
            left: `${drop.left}%`,
            animationDuration: `${drop.duration}s`,
            animationDelay: `${drop.delay}s`,
          }}
        />
      ))}
    </div>
  );
});

BackgroundRain.displayName = "BackgroundRain";

const MOTIVATIONAL_TEXTS = [
  { line1: "¡Tu mejor versión", line2: "está aquí!" },
  { line1: "El cambio comienza", line2: "con una decisión" },
  { line1: "Cada día es una", line2: "nueva oportunidad" },
  { line1: "Tu transformación", line2: "empieza ahora" },
];

function RecommendationScreen({ formData }) {
  const [currentMotivational, setCurrentMotivational] = useState(0);
  const navigate = useNavigate();

  // Rotar frases motivacionales cada 5 segundos (como en WelcomeScreen)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMotivational((prev) => (prev + 1) % MOTIVATIONAL_TEXTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Crear lluvia de corazones - MEMORIZADO
  const rainDrops = useMemo(() => {
    return Array.from({ length: 20 }, () => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 8,
      delay: -Math.random() * 13,
    }));
  }, []); // Array vacío = solo se crea una vez

  // Cálculos y recomendaciones basadas en el perfil
  const agua = (formData.weight * 0.035).toFixed(1);

  // Calcular calorías recomendadas (fórmula simplificada Harris-Benedict)
  const peso = parseFloat(formData.weight) || 70;
  const altura = parseFloat(formData.height) || 170;
  const edadEstimada = 25; // Estimación base

  // TMB base (Tasa Metabólica Basal)
  let tmb;
  if (formData.gender === "male") {
    tmb = 10 * peso + 6.25 * altura - 5 * edadEstimada + 5;
  } else {
    tmb = 10 * peso + 6.25 * altura - 5 * edadEstimada - 161;
  }

  // Factor de actividad
  const activityFactors = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };

  let calorias = Math.round(tmb * (activityFactors[formData.lifestyle] || 1.2));

  // Ajustar según objetivo
  if (formData.mainGoal === "lose_weight") {
    calorias = Math.round(calorias * 0.85); // Déficit del 15%
  } else if (formData.mainGoal === "gain_muscle") {
    calorias = Math.round(calorias * 1.15); // Superávit del 15%
  }

  // Días de entrenamiento recomendados según estilo de vida y objetivo
  let diasEntrenamiento;
  if (formData.mainGoal === "lose_weight") {
    diasEntrenamiento =
      formData.lifestyle === "sedentary" || formData.lifestyle === "light"
        ? "4-5"
        : "5-6";
  } else if (formData.mainGoal === "gain_muscle") {
    diasEntrenamiento = "4-5";
  } else {
    diasEntrenamiento =
      formData.lifestyle === "sedentary" || formData.lifestyle === "light"
        ? "3-4"
        : "4-5";
  }

  // Horas de sueño recomendadas
  const horasSueno = formData.mainGoal === "gain_muscle" ? "8-9" : "7-8";

  // Mapeo de valores a texto legible
  const goalText = {
    lose_weight: "Perder Peso",
    gain_muscle: "Ganar Músculo",
    get_toned: "Tonificar y Definir",
    maintain: "Mantenerte Saludable",
  };

  const lifestyleText = {
    sedentary: "Sedentario",
    light: "Ligeramente Activo",
    moderate: "Moderadamente Activo",
    active: "Activo",
    very_active: "Muy Activo",
  };

  const dietText = {
    omnivore: "Como de Todo",
    vegan: "Vegana",
    low_carb: "Baja en Carbohidratos",
  };

  // Función para scrollear a la sección de recomendaciones
  const scrollToRecommendations = () => {
    const recommendationsSection = document.getElementById(
      "recommendations-section"
    );
    if (recommendationsSection) {
      recommendationsSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className={styles.resultContainer}>
      {/* Lluvia de corazones - fondo */}
      <BackgroundRain rainDrops={rainDrops} />

      {/* PORTADA - Idéntica a WelcomeScreen */}
      <div className={styles.coverContainer}>
        <div className={styles.contentBox}>
          {/* Texto de bienvenida */}
          <h1 className="welcome-title">
            ¡Tu Plan Está Listo, {formData.name}!
          </h1>
          <p className="welcome-subtitle text-gradient">
            Estás a punto de comenzar una transformación que cambiará tu vida
            para siempre
          </p>

          {/* Logo grande - MISMO TAMAÑO QUE WELCOMESCREEN */}
          <div className="logo-container">
            <img src={liftyLogo} alt="Lifty" className="logo-main" />
          </div>

          {/* Frases motivacionales rotativas con espaciado */}
          <div className="motivational-container motivational-spacing">
            <p
              key={`line1-${currentMotivational}`}
              className="motivational-line"
            >
              {MOTIVATIONAL_TEXTS[currentMotivational].line1}
            </p>
            <p
              key={`line2-${currentMotivational}`}
              className="motivational-line"
            >
              {MOTIVATIONAL_TEXTS[currentMotivational].line2}
            </p>
          </div>

          <button className="btn-primary" onClick={scrollToRecommendations}>
            <Rocket size={20} />
            Quiero ver mis recomendaciones
          </button>
        </div>
      </div>

      {/* SECCIÓN DE RECOMENDACIONES */}
      <div
        id="recommendations-section"
        className={styles.recommendationsSection}
      >
        {/* Título de la sección de recomendaciones */}
        <h2
          className="welcome-title"
          style={{
            marginTop: "var(--lt-spacing-2xl)",
            marginBottom: "var(--lt-spacing-md)",
          }}
        >
          Tus Recomendaciones Personalizadas
        </h2>

        {/* Cards motivacionales animadas */}
        <div className={styles.motivationalCards}>
          <div className={`${styles.motivCard} ${styles.animCard1}`}>
            <Droplets size={32} style={{ color: "var(--lt-accent-color)" }} />
            <p className="text-gradient">
              La hidratación es fundamental para tu rendimiento y recuperación
            </p>
            <span className={styles.cardHighlight}>{agua}L / día</span>
          </div>

          <div className={`${styles.motivCard} ${styles.animCard2}`}>
            <Apple size={32} style={{ color: "var(--lt-accent-color)" }} />
            <p className="text-gradient">
              Consumo calórico recomendado para alcanzar tu objetivo
            </p>
            <span className={styles.cardHighlight}>{calorias} kcal / día</span>
          </div>

          <div className={`${styles.motivCard} ${styles.animCard3}`}>
            <Zap size={32} style={{ color: "var(--lt-accent-color)" }} />
            <p className="text-gradient">
              Días de entrenamiento recomendados para tu meta
            </p>
            <span className={styles.cardHighlight}>
              {diasEntrenamiento} días / semana
            </span>
          </div>

          <div className={`${styles.motivCard} ${styles.animCard4}`}>
            <Moon size={32} style={{ color: "var(--lt-accent-color)" }} />
            <p className="text-gradient">
              Horas de sueño para optimizar tu recuperación y resultados
            </p>
            <span className={styles.cardHighlight}>
              {horasSueno} horas / noche
            </span>
          </div>
        </div>

        {/* Título de la sección de perfil */}
        <h2
          className="welcome-title"
          style={{
            marginTop: "var(--lt-spacing-2xl)",
            marginBottom: "var(--lt-spacing-md)",
          }}
        >
          Resumen de tu Perfil
        </h2>

        {/* Resumen del perfil en card */}
        <div className={styles.profileCard}>
          <div className={styles.profileGrid}>
            <div className={styles.profileItem}>
              <Target size={20} />
              <span>Objetivo:</span>
              <strong>{goalText[formData.mainGoal]}</strong>
            </div>
            <div className={styles.profileItem}>
              <Activity size={20} />
              <span>Estilo de vida:</span>
              <strong>{lifestyleText[formData.lifestyle]}</strong>
            </div>
            <div className={styles.profileItem}>
              <UtensilsCrossed size={20} />
              <span>Dieta:</span>
              <strong>{dietText[formData.diet]}</strong>
            </div>
            <div className={styles.profileItem}>
              <Calendar size={20} />
              <span>Comidas al día:</span>
              <strong>{formData.mealFrequency}</strong>
            </div>
          </div>
        </div>

        {/* Título de la sección de ruta al éxito */}
        <h2
          className="welcome-title"
          style={{
            marginTop: "var(--lt-spacing-2xl)",
            marginBottom: "var(--lt-spacing-md)",
          }}
        >
          Tu Ruta Hacia el Éxito
        </h2>

        {/* Sección de texto con gradient */}
        <div className={styles.textSection}>
          <p className={styles.sectionText}>
            Basado en tu objetivo de{" "}
            <strong>{goalText[formData.mainGoal]}</strong> y tu estilo de vida{" "}
            <strong>{lifestyleText[formData.lifestyle]}</strong>, hemos diseñado
            un plan completo que te guiará paso a paso hacia tu transformación.
            Recuerda que la constancia y la dedicación son tus mejores aliados
            en este viaje.
          </p>

          {/* Botón para ver el plan */}
          <button
            className="btn-primary"
            style={{ marginTop: "var(--lt-spacing-xl)" }}
            onClick={() =>
              navigate("/register", { state: { fromWizard: true } })
            }
          >
            <Rocket size={20} />
            ¡Quiero comenzar ahora!
          </button>
        </div>

        {/* Espacio extra al final de la página */}
        <div style={{ height: "var(--lt-spacing-2xl)" }} />
      </div>
    </div>
  );
}

export default RecommendationScreen;
