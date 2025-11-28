import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import LogoLarge from "../../assets/Logo/LogoLiftyLarge.png";
import NotificationBell from "../NotificationBell/NotificationBell";
import "./SimpleHeader.css";

const SimpleHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="simple-header">
      <div className="simple-header-container">
        {/* Botón Volver */}
        <button
          className="simple-back-btn"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: "instant" });
            navigate(-1);
          }}
          aria-label="Volver"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>

        {/* Logo/Título */}
        <div className="simple-header-logo">
          <img
            src={LogoLarge}
            alt="LiftyApp"
            className="simple-header-logo-img"
          />
        </div>

        {/* Notificaciones */}
        <div className="simple-header-notifications">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
};

export default SimpleHeader;
