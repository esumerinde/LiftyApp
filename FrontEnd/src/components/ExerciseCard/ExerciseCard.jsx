import { useState, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import "./ExerciseCard.css";

const ExerciseCard = ({ exercise }) => {
  const {
    id_exercise,
    name,
    description,
    image_url,
    video_url,
    muscle_group_name,
  } = exercise;

  const [showVideo, setShowVideo] = useState(false);
  const [showVideoSpinner, setShowVideoSpinner] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const cardRef = useRef(null);
  const videoRef = useRef(null);

  // Intersection Observer para animación al entrar en viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentCard = cardRef.current;
    if (currentCard) {
      observer.observe(currentCard);
    }

    return () => {
      if (currentCard) {
        observer.unobserve(currentCard);
      }
    };
  }, []);

  const handleViewDemo = () => {
    // Mostrar spinner mientras carga el video
    setShowVideoSpinner(true);
    setShowVideo(true);
    setVideoLoaded(false);
  };

  const handleCloseVideo = () => {
    // Agregar clase de fade out antes de cerrar
    const modal = document.querySelector(".lifty-exercise-video-modal");
    const container = document.querySelector(".lifty-exercise-video-container");

    if (modal) modal.classList.add("modal-fade-out");
    if (container) container.classList.add("container-fade-out");

    setTimeout(() => {
      setShowVideo(false);
      setShowVideoSpinner(false);
      setVideoEnded(false);
      setVideoLoaded(false);
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }, 300);
  };

  const handleVideoEnd = () => {
    setVideoEnded(true);
  };

  const handleVideoLoaded = () => {
    setVideoLoaded(true);
    setShowVideoSpinner(false);
    // Reproducir video cuando carga completamente
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Error al reproducir video:", err);
      });
    }
  };

  const handlePlayAgain = () => {
    setVideoEnded(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.log("Error al reproducir video:", err);
      });
    }
  };

  // Traducción de grupos musculares a español
  const muscleGroupTranslations = {
    Chest: "Pecho",
    Back: "Espalda",
    Shoulders: "Hombros",
    Legs: "Piernas",
    Biceps: "Bíceps",
    Triceps: "Tríceps",
    Calves: "Pantorrillas",
    Abs: "Abs",
    Cardio: "Cardio",
    "Full Body": "Cuerpo Completo",
  };

  // Versión abreviada para badges pequeños
  const muscleGroupAbbreviations = {
    Abdominales: "Abs",
    "Cuerpo Completo": "Full Body",
    Pantorrillas: "Gemelos",
    Espalda: "Espalda",
    Pecho: "Pecho",
    Hombros: "Hombros",
    Piernas: "Piernas",
    Bíceps: "Bíceps",
    Tríceps: "Tríceps",
    Cardio: "Cardio",
  };

  return (
    <>
      <article
        ref={cardRef}
        id="exercise-card-custom"
        className={`lifty-diet-card ${isVisible ? "lifty-card-visible" : ""}`}
      >
        {/* Imagen del ejercicio - columna izquierda */}
        <div className="lifty-exercise-card-image">
          <img src={image_url} alt={name} />
        </div>

        {/* Contenido - columna derecha */}
        <div className="exercise-card-content-wrapper">
          {/* Fila superior: Badge + Botón Ver Demo */}
          <div className="exercise-card-top-row">
            <span className="lifty-badge-dark">
              {muscleGroupTranslations[muscle_group_name] || muscle_group_name}
            </span>
            <button
              className="lifty-btn-secondary-dark exercise-demo-btn-small"
              onClick={handleViewDemo}
              aria-label={`Ver demo de ${name}`}
            >
              <Play size={14} strokeWidth={2} fill="currentColor" />
              Ver Demo
            </button>
          </div>

          {/* Título del ejercicio */}
          <h3 className="lifty-diet-card-title">{name}</h3>

          {/* Descripción */}
          {description && (
            <p className="lifty-diet-card-description">{description}</p>
          )}
        </div>
      </article>

      {/* Spinner de carga con contenedor grande */}
      {showVideoSpinner && (
        <div className="lifty-video-loading-overlay" onClick={handleCloseVideo}>
          <div className="lifty-loading-container">
            <div className="loading-spinner-large"></div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && videoLoaded && (
        <div className="lifty-exercise-video-modal" onClick={handleCloseVideo}>
          <div
            className="lifty-exercise-video-container video-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="lifty-exercise-video-close"
              onClick={handleCloseVideo}
              aria-label="Cerrar video"
            >
              ✕
            </button>
            <h3 className="lifty-exercise-video-title">{name}</h3>

            <div className="video-wrapper">
              <video
                ref={videoRef}
                className="lifty-exercise-video"
                muted
                playsInline
                onEnded={handleVideoEnd}
                onLoadedData={handleVideoLoaded}
              >
                <source src={video_url} type="video/mp4" />
              </video>
              {/* Gradient overlay */}
              <div className="video-gradient-overlay"></div>

              {/* Botones cuando termina el video */}
              {videoEnded && (
                <div className="video-ended-controls">
                  <button
                    className="lifty-btn-secondary-dark video-control-btn"
                    onClick={handlePlayAgain}
                  >
                    <Play size={18} strokeWidth={2} fill="currentColor" />
                    Ver de nuevo
                  </button>
                  <button
                    className="lifty-btn-secondary-dark video-control-btn"
                    onClick={handleCloseVideo}
                  >
                    Cerrar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video oculto para precarga */}
      {showVideo && !videoLoaded && (
        <video
          ref={videoRef}
          style={{ display: "none" }}
          muted
          playsInline
          onLoadedData={handleVideoLoaded}
        >
          <source src={video_url} type="video/mp4" />
        </video>
      )}
    </>
  );
};

export default ExerciseCard;
