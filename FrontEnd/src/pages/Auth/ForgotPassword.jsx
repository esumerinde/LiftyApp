import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Loader2 } from "lucide-react";
import axios from "axios";
import LogoMini from "../../assets/Logo/LogoLiftyMini.png";
import SimpleHeader from "../../components/SimpleHeader/SimpleHeader";
import "../Auth/Auth.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/password-reset/request",
        { email }
      );

      if (response.data.success) {
        setSuccess(true);
        // Redirigir a la página de reset después de 1 segundo
        setTimeout(() => {
          navigate("/reset-password", { state: { email } });
        }, 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al enviar el código. Intenta nuevamente."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <SimpleHeader />
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={LogoMini}
              alt="LiftyApp Logo"
              className="logo-image logo-image-mini"
            />
          </div>
          <h1 className="auth-title">Recuperar Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa tu email y te enviaremos un código de verificación
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email Input */}
          <div className="auth-input-group">
            <label className="auth-label">Email</label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={20} />
              <input
                type="email"
                className="auth-input"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="auth-error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="auth-success-message">
              <p>✅ Código enviado exitosamente. Redirigiendo...</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-btn-primary"
            disabled={isLoading || success}
          >
            {isLoading ? (
              <>
                <Loader2 className="auth-spinner" size={20} />
                Enviando...
              </>
            ) : success ? (
              "✓ Código Enviado"
            ) : (
              "Enviar Código"
            )}
          </button>

          {/* Volver al Login */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿Recordaste tu contraseña?{" "}
              <Link to="/login" className="auth-link">
                Inicia sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
