import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Mail, Lock, Eye, EyeOff, Chrome } from "lucide-react";
import LogoMini from "../../assets/Logo/LogoLiftyMini.png";
import SimpleHeader from "../../components/SimpleHeader/SimpleHeader";
import { login as loginService } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;
  const { updateUser } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);

  // LoadingTransition component
  const LoadingTransition = () => {
    return (
      <div className="loading-transition-overlay">
        <div className="loading-transition-content">
          <div className="loading-spinner-large"></div>
          <h3 className="loading-transition-title">Iniciando sesión</h3>
          <p className="loading-transition-message">Redirigiendo...</p>
        </div>
      </div>
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Usar el servicio de autenticación con axios
      const result = await loginService(formData.email, formData.password);

      if (result.success) {
        // Login exitoso
        console.log("Login exitoso:", result.data);

        // Actualizar contexto global con datos del usuario
        updateUser(result.data.user);

        // Mostrar transición animada
        setShowTransition(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Redirigir a Home
        window.scrollTo({ top: 0, behavior: "instant" });
        navigate("/");
      } else {
        // Error de credenciales
        setErrors({
          submit: result.message || "Credenciales inválidas",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({
        submit: "Error de conexión. Verifica que el servidor esté activo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirigir al endpoint de Google OAuth del backend
    window.location.href = "http://localhost:3000/api/auth/google";
  };

  return (
    <div className="auth-container">
      <SimpleHeader />
      {showTransition ? (
        <LoadingTransition />
      ) : (
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <img
                src={LogoMini}
                alt="LiftyApp Logo"
                className="logo-image logo-image-mini"
              />
            </div>
            <h1 className="auth-title">Iniciar Sesión</h1>
            <p className="auth-subtitle">Bienvenido de vuelta</p>
          </div>

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="auth-success-banner">{successMessage}</div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Error general */}
            {errors.submit && (
              <div className="auth-error-banner">{errors.submit}</div>
            )}

            {/* Email */}
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                Email
              </label>
              <div className="auth-input-wrapper">
                <Mail className="auth-input-icon" size={20} />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`auth-input ${errors.email ? "error" : ""}`}
                  placeholder="tu@email.com"
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <span className="auth-error-text">{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">
                Contraseña
              </label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={20} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`auth-input ${errors.password ? "error" : ""}`}
                  placeholder="Tu contraseña"
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="auth-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className="auth-error-text">{errors.password}</span>
              )}
            </div>

            {/* Olvidé mi contraseña */}
            <div className="auth-forgot-password">
              <Link to="/forgot-password" className="auth-link-small">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="auth-spinner"></span>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider">
            <span>O continuar con</span>
          </div>

          {/* Google Login (Mockup) */}
          <button
            type="button"
            className="auth-btn-google"
            onClick={handleGoogleLogin}
          >
            <Chrome size={20} strokeWidth={2} />
            Continuar con Google
          </button>

          {/* Footer */}
          <div className="auth-footer">
            <p className="auth-footer-text">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="auth-link">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
