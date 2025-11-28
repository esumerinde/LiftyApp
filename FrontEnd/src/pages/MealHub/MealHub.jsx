import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Compass,
  BookOpen,
  PenSquare,
  UserPlus,
} from "lucide-react";
import "./MealHub.css";

const MealHub = () => {
  const navigate = useNavigate();

  const handleGoToExplore = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/explore");
  };

  const handleGoToMeals = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/meals");
  };

  const handleCreateNewDiet = () => {
    console.log("Crear nueva dieta");
    // TODO: Navegar a creador de dietas
  };

  const handleConsultNutritionist = () => {
    console.log("Consultar con un nutricionista");
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
          <h1 className="lifty-hub-title">Comer</h1>
          <p className="lifty-hub-subtitle">¿Qué vas a hacer hoy?</p>
        </header>

        {/* Botones de Acción */}
        <div className="lifty-hub-actions">
          {/* Botón 1: Explorar */}
          <button className="lifty-hub-btn primary" onClick={handleGoToExplore}>
            <div className="lifty-hub-btn-icon">
              <Compass size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Explorar</h3>
              <p className="lifty-hub-btn-description">
                Descubre nuevas recetas y planes de alimentación
              </p>
            </div>
          </button>

          {/* Botón 2: Mis Dietas */}
          <button className="lifty-hub-btn secondary" onClick={handleGoToMeals}>
            <div className="lifty-hub-btn-icon">
              <BookOpen size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Mis Dietas</h3>
              <p className="lifty-hub-btn-description">
                Accede a tus planes de alimentación guardados
              </p>
            </div>
          </button>

          {/* Botón 3: Crear Dieta Nueva */}
          <button
            className="lifty-hub-btn tertiary"
            onClick={handleCreateNewDiet}
          >
            <div className="lifty-hub-btn-icon">
              <PenSquare size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Crear Dieta Nueva</h3>
              <p className="lifty-hub-btn-description">
                Diseña un plan de alimentación personalizado
              </p>
            </div>
          </button>

          {/* Botón 4: Consultar Nutricionista */}
          <button
            className="lifty-hub-btn quaternary"
            onClick={handleConsultNutritionist}
          >
            <div className="lifty-hub-btn-icon">
              <UserPlus size={32} strokeWidth={2} />
            </div>
            <div className="lifty-hub-btn-content">
              <h3 className="lifty-hub-btn-title">Consultar Nutricionista</h3>
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

export default MealHub;
