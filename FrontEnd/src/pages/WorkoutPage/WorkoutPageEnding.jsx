import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Camera, Calendar, Clock } from "lucide-react";
import { createWorkoutLog } from "../../services/workoutLogsService";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import "./WorkoutPageEnding.css";

const WorkoutPageEnding = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetWorkout } = useActiveWorkout();
  const workoutData = location.state?.workoutData || {};

  const {
    duration = 0,
    exercises = [],
    totalVolume = 0,
    routineId,
    routineName,
  } = workoutData;

  const [workoutTitle, setWorkoutTitle] = useState(
    routineName || "Entrenamiento de la tarde"
  );
  const [workoutNotes, setWorkoutNotes] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    return `${m}m`;
  };

  const formatDate = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `Hoy a las ${hour12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${ampm}`;
  };

  const handleSaveWorkout = async () => {
    setIsSaving(true);

    const now = new Date();
    const startDate = new Date(now.getTime() - duration * 1000);

    // Transformar ejercicios para asegurar que tengan id_exercise
    const exercisesFormatted = exercises.map((ex) => ({
      id_exercise: ex.id_exercise || ex.id,
      name: ex.name,
      sets: ex.sets,
      notes: ex.notes || null,
    }));

    console.log("📋 Ejercicios formateados:", exercisesFormatted);

    const logData = {
      id_routine: routineId || null,
      log_date: now.toISOString().split("T")[0], // YYYY-MM-DD
      start_time: startDate.toISOString().slice(0, 19).replace("T", " "), // YYYY-MM-DD HH:MM:SS
      end_time: now.toISOString().slice(0, 19).replace("T", " "), // YYYY-MM-DD HH:MM:SS
      duration_minutes: Math.floor(duration / 60),
      title: workoutTitle,
      description: workoutNotes,
      image_url: imageUrl || null,
      rating: null,
      visibility: "public",
      exercises: exercisesFormatted, // Incluir ejercicios con sus sets
    };

    console.log("📤 Enviando datos al backend:", logData);

    const result = await createWorkoutLog(logData);

    if (result.success) {
      console.log("✅ Entrenamiento guardado:", result.data);
      // Ahora sí resetear el workout después de guardar
      resetWorkout();
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate("/?tab=entrenamientos");
    } else {
      console.error("❌ Error al guardar:", result.message);
      console.error("Detalles del error:", result.error);
      alert("Error al guardar el entrenamiento. Intenta nuevamente.");
      setIsSaving(false);
    }
  };

  const handleDiscardWorkout = () => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres descartar este entrenamiento?"
      )
    ) {
      // Resetear el workout al descartar
      resetWorkout();
      window.scrollTo({ top: 0, behavior: "instant" });
      navigate("/");
    }
  };

  const handleBack = () => {
    // NO resetear - solo volver atrás para que el usuario pueda continuar
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(-1);
  };

  return (
    <div className="wpe-container">
      <div className="wpe-header">
        <button className="wpe-back-btn" onClick={handleBack}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="wpe-header-title">Finalizar Entrenamiento</h1>
      </div>

      <div className="wpe-form">
        {/* Workout Title */}
        <div className="wpe-field">
          <input
            type="text"
            className="wpe-input"
            value={workoutTitle}
            onChange={(e) => setWorkoutTitle(e.target.value)}
            placeholder="Título del entrenamiento"
          />
        </div>

        {/* Workout Notes */}
        <div className="wpe-field">
          <textarea
            className="wpe-textarea"
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="¿Cómo estuvo? Comparte más sobre tu entrenamiento."
            rows={4}
          />
        </div>

        {/* Add Photos/Videos */}
        <div className="wpe-field wpe-media-field">
          <Camera size={32} className="wpe-media-icon" />
          <span className="wpe-media-text">Añadir Fotos/Videos</span>
        </div>

        {/* Date */}
        <div className="wpe-field wpe-info-field">
          <Calendar size={20} className="wpe-info-icon" />
          <span className="wpe-info-text">{formatDate()}</span>
        </div>

        {/* Duration */}
        <div className="wpe-field wpe-info-field">
          <Clock size={20} className="wpe-info-icon" />
          <span className="wpe-info-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="wpe-actions">
        <button
          className="lifty-btn-primary wpe-save-btn"
          onClick={handleSaveWorkout}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar Entrenamiento"}
        </button>
        <button className="wpe-discard-btn" onClick={handleDiscardWorkout}>
          Descartar Entrenamiento
        </button>
      </div>
    </div>
  );
};

export default WorkoutPageEnding;
