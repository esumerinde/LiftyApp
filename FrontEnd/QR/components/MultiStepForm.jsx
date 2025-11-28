import { useState, useEffect, useMemo } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import styles from "./MultiStepForm.module.css";
import Step1 from "./Step1";
import Step2Gender from "./Step2Gender";
import Step2Weight from "./Step2Weight";
import Step2Height from "./Step2Height";
import Step3 from "./Step3";
import Step4 from "./Step4";
import Step5 from "./Step5";
import Step6 from "./Step6";
import LoadingScreen from "./LoadingScreen";

const MOTIVATIONAL_TEXTS_STEP1 = [
  { line1: "¡Tu mejor versión", line2: "está a un paso de distancia!" },
  { line1: "Cada gran cambio", line2: "empieza con una decisión" },
  { line1: "El momento perfecto", line2: "es ahora" },
  { line1: "Transforma tu vida", line2: "paso a paso" },
];

const MOTIVATIONAL_TEXTS_STEP2 = [
  { line1: "Cada dato cuenta", line2: "para diseñar tu plan" },
  { line1: "Tu cuerpo es único", line2: "tu plan también lo será" },
  { line1: "Conocerte es el primer ", line2: "paso a dar" },
  { line1: "La información correcta", line2: "es poder real" },
];

const MOTIVATIONAL_TEXTS_STEP3 = [
  { line1: "Tu estilo de vida", line2: "define tu transformación" },
  { line1: "Pequeños cambios", line2: "grandes resultados" },
  { line1: "El movimiento es vida", line2: "¡vamos por más!" },
  { line1: "Cada paso cuenta", line2: "en tu viaje fitness" },
];

const MOTIVATIONAL_TEXTS_STEP4 = [
  { line1: "La nutrición es el 70%", line2: "del camino hacia tu meta" },
  { line1: "Comer bien es quererte", line2: "y cuidar tu cuerpo" },
  { line1: "Tu alimentación", line2: "es tu medicina diaria" },
  { line1: "Cada comida es una oportunidad", line2: "de nutrir tu cambio" },
];

const MOTIVATIONAL_TEXTS_STEP5 = [
  { line1: "Define tu meta", line2: "y el universo conspirará" },
  { line1: "Tu objetivo es tu brújula", line2: "en este viaje" },
  { line1: "Soñar es el primer paso", line2: "para lograr cualquier meta" },
  { line1: "Una meta clara", line2: "es medio camino andado" },
];

const MOTIVATIONAL_TEXTS_STEP6 = [
  { line1: "¡Estás a punto de comenzar!", line2: "Tu nueva vida te espera" },
  { line1: "La consistencia", line2: "es la clave del éxito" },
  { line1: "Cada comida cuenta", line2: "en tu transformación" },
  { line1: "Tu plan personalizado", line2: "está casi listo" },
];

function MultiStepForm({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [animateStep, setAnimateStep] = useState(false);
  const [currentMotivational, setCurrentMotivational] = useState(0);
  const [currentMotivational2, setCurrentMotivational2] = useState(0);
  const [currentMotivational3, setCurrentMotivational3] = useState(0);
  const [currentMotivational4, setCurrentMotivational4] = useState(0);
  const [currentMotivational5, setCurrentMotivational5] = useState(0);
  const [currentMotivational6, setCurrentMotivational6] = useState(0);
  const [currentMotivational7, setCurrentMotivational7] = useState(0);
  const [currentMotivational8, setCurrentMotivational8] = useState(0);

  // Memorizar las lluvias para que no se recreen
  const rainDrops = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: Math.random() * 100,
      duration: 5 + Math.random() * 8,
      delay: -Math.random() * 13,
    }));
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    weight: "",
    height: "",
    gender: "",
    lifestyle: "",
    diet: "",
    mainGoal: "",
    mealFrequency: "",
  });

  // Determinar el total de pasos (ahora son 8 porque Step2 se divide en 3)
  const totalSteps = 8;

  // Mapeo de steps para mostrar en la barra de progreso (mostrar como "Paso X de 6")
  const getVisualStep = (step) => {
    if (step === 1) return 1; // Step1 = Paso 1
    if (step >= 2 && step <= 4) return 2; // Step2Gender/Weight/Height = Paso 2
    if (step === 5) return 3; // Step3 = Paso 3
    if (step === 6) return 4; // Step4 = Paso 4
    if (step === 7) return 5; // Step5 = Paso 5
    if (step === 8) return 6; // Step6 = Paso 6
    return step;
  };

  // Rotar textos motivacionales en Paso 1
  useEffect(() => {
    if (currentStep === 1) {
      const textInterval = setInterval(() => {
        setCurrentMotivational(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP1.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Paso 2
  useEffect(() => {
    if (currentStep === 2) {
      const textInterval = setInterval(() => {
        setCurrentMotivational2(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP2.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Paso 3
  useEffect(() => {
    if (currentStep === 3) {
      const textInterval = setInterval(() => {
        setCurrentMotivational3(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP3.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Paso 4
  useEffect(() => {
    if (currentStep === 4) {
      const textInterval = setInterval(() => {
        setCurrentMotivational4(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP4.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Paso 5
  useEffect(() => {
    if (currentStep === 5) {
      const textInterval = setInterval(() => {
        setCurrentMotivational5(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP5.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Paso 6
  useEffect(() => {
    if (currentStep === 6) {
      const textInterval = setInterval(() => {
        setCurrentMotivational6(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP6.length
        );
      }, 5000); // 5 segundos (sincronizado con animación CSS)
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Step2Weight (step 3)
  useEffect(() => {
    if (currentStep === 3) {
      const textInterval = setInterval(() => {
        setCurrentMotivational7(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP2.length
        );
      }, 5000);
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Rotar textos motivacionales en Step2Height (step 4)
  useEffect(() => {
    if (currentStep === 4) {
      const textInterval = setInterval(() => {
        setCurrentMotivational8(
          (prev) => (prev + 1) % MOTIVATIONAL_TEXTS_STEP2.length
        );
      }, 5000);
      return () => clearInterval(textInterval);
    }
  }, [currentStep]);

  // Activar animación al montar INICIAL (solo para Step1 desde WelcomeScreen)
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStep(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []); // Solo al montar, no cuando cambia currentStep

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      // Solo mostrar loading para transiciones entre grupos de pasos (no entre sub-steps de Step2)
      const shouldShowLoading =
        currentStep === 1 || // Después de Step1
        currentStep === 4 || // Después de Step2Height (último de Step2)
        currentStep === 5 || // Después de Step3
        currentStep === 6 || // Después de Step4
        currentStep === 7; // Después de Step5

      if (shouldShowLoading) {
        setIsLoading(true);
        setAnimateStep(false);

        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setIsLoading(false);
          setTimeout(() => {
            setAnimateStep(true);
          }, 50);
        }, 9000);
      } else {
        // Transición rápida sin loading para sub-steps de Step2
        setAnimateStep(false);
        setTimeout(() => {
          setCurrentStep((prev) => prev + 1);
          setTimeout(() => {
            setAnimateStep(true);
          }, 50);
        }, 300);
      }
    } else {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setAnimateStep(false); // Resetear animación
      setCurrentStep((prev) => prev - 1);
      // Activar animación después de renderizar
      setTimeout(() => {
        setAnimateStep(true);
      }, 50);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== "";
      case 2:
        return formData.gender !== "";
      case 3:
        return formData.weight !== "";
      case 4:
        return formData.height !== "";
      case 5:
        return formData.lifestyle !== "";
      case 6:
        return formData.diet !== "";
      case 7:
        return formData.mainGoal !== "";
      case 8:
        return formData.mealFrequency !== "";
      default:
        return false;
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* Barra de progreso */}
      <div className={styles.progressBarContainer}>
        <div
          className={styles.progressBarFill}
          style={{ width: `${(getVisualStep(currentStep) / 6) * 100}%` }}
        />
      </div>

      <div className={styles.stepIndicator}>
        Paso {getVisualStep(currentStep)} de 6
      </div>

      {isLoading ? (
        <LoadingScreen currentStep={currentStep} />
      ) : (
        <>
          {/* Paso 1: Nombre */}
          {currentStep === 1 && (
            <Step1
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational}
              rainDrops={rainDrops}
              animateStep={animateStep}
            />
          )}

          {/* Paso 2.1: Género */}
          {currentStep === 2 && (
            <Step2Gender
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational2}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP2}
              animateStep={animateStep}
            />
          )}

          {/* Paso 2.2: Peso */}
          {currentStep === 3 && (
            <Step2Weight
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational7}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP2}
              animateStep={animateStep}
            />
          )}

          {/* Paso 2.3: Altura */}
          {currentStep === 4 && (
            <Step2Height
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational8}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP2}
              animateStep={animateStep}
            />
          )}

          {/* Paso 3: Estilo de Vida */}
          {currentStep === 5 && (
            <Step3
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational3}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP3}
              animateStep={animateStep}
            />
          )}

          {/* Paso 4: Dieta Actual */}
          {currentStep === 6 && (
            <Step4
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational4}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP4}
              animateStep={animateStep}
            />
          )}

          {/* Paso 5: Objetivo Principal */}
          {currentStep === 7 && (
            <Step5
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational5}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP5}
              animateStep={animateStep}
            />
          )}

          {/* Paso 6: Preferencias Finales */}
          {currentStep === 8 && (
            <Step6
              formData={formData}
              handleChange={handleChange}
              currentMotivational={currentMotivational6}
              rainDrops={rainDrops}
              MOTIVATIONAL_TEXTS={MOTIVATIONAL_TEXTS_STEP6}
              animateStep={animateStep}
            />
          )}

          {/* Botones de navegación */}
          <div className={`fadeInUp2Delayed ${animateStep ? "visible" : ""}`}>
            <div className={styles.buttonGroup}>
              {currentStep > 1 && (
                <button className={styles.backButton} onClick={handleBack}>
                  <ChevronLeft size={20} />
                  Atrás
                </button>
              )}
              <button
                className={styles.nextButton}
                onClick={handleNext}
                disabled={!isStepValid()}
              >
                {currentStep === 8 ? (
                  <>
                    <Sparkles size={20} />
                    ¡Generar mi Plan!
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Siguiente
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MultiStepForm;
