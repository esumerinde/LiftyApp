import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Dumbbell,
  ClipboardList,
  Compass,
  PenSquare,
  UserPlus,
} from "lucide-react";
import { useActiveWorkout } from "../../context/ActiveWorkoutContext";
import "./WorkoutHub.css";

const WorkoutHub = () => {
  const navigate = useNavigate();
  const { startWorkout } = useActiveWorkout();

  const handleStartEmptyWorkout = () => {
    startWorkout({ exercises: [] });
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/workout");
  };

  const handleGoToSavedRoutines = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/my-saved-routines");
  };

  const handleCreateNewRoutine = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/routine-builder");
  };

  const handleGoToExplore = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/explore");
  };

  const handleConsultTrainer = () => {
    console.log("Consultar con un entrenador");
    // TODO: Implementar lógica de consulta
  };

  return (
    <div className="lifty-hub-page">
      <div className="lifty-hub-container">
        {/* Back Button */}
        <button
          className="lifty-back-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate(-1);
          }}
        >
          <ArrowLeft size={24} strokeWidth={2} />
        </button>

        {/* Header */}
        <header className="lifty-hub-header">
          <h1 className="lifty-hub-title">Entrenar</h1>
          <p className="lifty-hub-subtitle">¿Cómo querés entrenar hoy?</p>
        </header>

        {/* Botones de Acción */}
        <div className="lifty-hub-actions">
          {/* Botón 1: Comenzar Entrenamiento Vacío */}
          <button
            className="lifty-hub-btn primary"
            onClick={handleStartEmptyWorkout}
          >
            <div className="lifty-hub-btn-icon">
              <Dumbbell size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">
                Comenzar Entrenamiento Vacío
              </h3>
              <p className="lifty-hub-btn-description">
                Empezá de cero y añadí ejercicios sobre la marcha
              </p>
            </div>
          </button>

          {/* Botón 2: Crear Nueva Rutina */}
          <button
            className="lifty-hub-btn quaternary"
            onClick={handleCreateNewRoutine}
          >
            <div className="lifty-hub-btn-icon">
              <PenSquare size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Crear Nueva Rutina</h3>
              <p className="lifty-hub-btn-description">
                Diseñá una rutina de entrenamiento personalizada
              </p>
            </div>
          </button>

          {/* Botón 3: Mis Rutinas */}
          <button
            className="lifty-hub-btn secondary"
            onClick={handleGoToSavedRoutines}
          >
            <div className="lifty-hub-btn-icon">
              <ClipboardList size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Mis Rutinas</h3>
              <p className="lifty-hub-btn-description">
                Accedé a tus rutinas de entrenamiento guardadas
              </p>
            </div>
          </button>

          {/* Botón 4: Explorar */}
          <button
            className="lifty-hub-btn tertiary"
            onClick={handleGoToExplore}
          >
            <div className="lifty-hub-btn-icon">
              <Compass size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Explorar</h3>
              <p className="lifty-hub-btn-description">
                Descubre nuevas rutinas y ejercicios
              </p>
            </div>
          </button>

          {/* Botón 5: Consultar Entrenador */}
          <button
            className="lifty-hub-btn quinary"
            onClick={handleConsultTrainer}
          >
            <div className="lifty-hub-btn-icon">
              <UserPlus size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Consultar Entrenador</h3>
              <p className="lifty-hub-btn-description">
                Conectá con un profesional para ser asesorado
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkoutHub;
