import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Loader2, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import LogoMini from "../../assets/Logo/LogoLiftyMini.png";
import SimpleHeader from "../../components/SimpleHeader/SimpleHeader";
import "../Auth/Auth.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = location.state?.email || "";
  const inputsRef = useRef([]);

  const [formData, setFormData] = useState({
    email: emailFromState,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Si no hay email, redirigir a forgot-password
  useEffect(() => {
    if (!emailFromState) {
      navigate("/forgot-password");
    }
  }, [emailFromState, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Manejo de código de verificación (6 dígitos individuales)
  const handleCodeChange = (e, index) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // Solo números

    const codeArray = formData.code.padEnd(6, " ").split("");
    codeArray[index] = value;
    const newCode = codeArray.join("").trimEnd();

    setFormData({ ...formData, code: newCode });
    setError("");

    // Auto-focus al siguiente input
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (e, index) => {
    if (e.key === "Backspace" && !formData.code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones
    if (formData.code.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/password-reset/reset",
        {
          email: formData.email,
          code: formData.code,
          newPassword: formData.newPassword,
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate("/login", {
            state: { message: "Contraseña actualizada. Inicia sesión con tu nueva contraseña." },
          });
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Error al resetear la contraseña. Intenta nuevamente."
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
          <h1 className="auth-title">Nueva Contraseña</h1>
          <p className="auth-subtitle">
            Ingresa el código que recibiste en <strong>{formData.email}</strong>
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Código de Verificación */}
          <div className="auth-input-group">
            <label className="auth-label">Código de Verificación</label>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "center",
                marginBottom: error ? "0.5rem" : "1.5rem",
                transition: "margin-bottom 0.3s ease",
              }}
            >
              {Array(6)
                .fill(0)
                .map((_, index) => {
                  const codeArray = formData.code.padEnd(6, " ").split("");
                  const digitValue =
                    codeArray[index] === " " ? "" : codeArray[index];

                  return (
                    <input
                      key={index}
                      ref={(el) => (inputsRef.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digitValue}
                      onChange={(e) => handleCodeChange(e, index)}
                      onKeyDown={(e) => handleCodeKeyDown(e, index)}
                      disabled={isLoading || success}
                      autoComplete="off"
                      inputMode="numeric"
                      style={{
                        width: "40px",
                        height: "55px",
                        textAlign: "center",
                        fontSize: "1.5rem",
                        fontWeight: "700",
                        border: "2px solid",
                        borderColor: error
                          ? "var(--lifty-error)"
                          : digitValue
                          ? "var(--lifty-accent-main)"
                          : "#ccc",
                        borderRadius: "8px",
                        background: "var(--lifty-bg-input)",
                        color: "var(--lifty-text-primary)",
                        outline: "none",
                        transition: "all 0.2s ease",
                        opacity: isLoading || success ? 0.5 : 1,
                        cursor: isLoading || success ? "not-allowed" : "text",
                      }}
                    />
                  );
                })}
            </div>
          </div>

          {/* Nueva Contraseña */}
          <div className="auth-input-group">
            <label className="auth-label">Nueva Contraseña</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                className="auth-input"
                placeholder="Mínimo 6 caracteres"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading || success}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirmar Contraseña */}
          <div className="auth-input-group">
            <label className="auth-label">Confirmar Contraseña</label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                className="auth-input"
                placeholder="Confirma tu contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading || success}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
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
              <p>✅ Contraseña actualizada exitosamente. Redirigiendo...</p>
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
                Actualizando...
              </>
            ) : success ? (
              "✓ Contraseña Actualizada"
            ) : (
              "Restablecer Contraseña"
            )}
          </button>

          {/* Volver al Login */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿No recibiste el código?{" "}
              <Link to="/forgot-password" className="auth-link">
                Solicitar nuevo código
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
