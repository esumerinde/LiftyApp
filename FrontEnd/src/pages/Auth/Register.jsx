import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
  ChevronLeft,
  XCircle,
} from "lucide-react";
import LogoMini from "../../assets/Logo/LogoLiftyMini.png";
import SimpleHeader from "../../components/SimpleHeader/SimpleHeader";
import {
  requestVerificationCode,
  verifyCode as verifyCodeService,
  register as registerService,
  checkEmailAvailability,
  checkUsernameAvailability,
} from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const Register = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Leer datos del wizard si existen
  const wizardData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("wizardData") || "{}");
    } catch {
      return {};
    }
  }, []);

  // Estados globales del flujo
  const [formData, setFormData] = useState({
    email: "",
    name: wizardData.name || "",
    username: "",
    password: "",
    isEmailValidated: false,
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: email, 2: validar email, 3: nombre, 4: contraseña, 5: success
  const [error, setError] = useState("");
  const [showTransition, setShowTransition] = useState(false);
  const [transitionMessage, setTransitionMessage] = useState("");

  // Estados para el paso de validación de email (persistentes entre renders)
  const [verificationCode, setVerificationCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [sendLoading, setSendLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const inputsRef = useRef([]);

  // Estados para el paso de nombre y usuario
  const [name, setName] = useState(formData.name || "");
  const [username, setUsername] = useState(formData.username || "");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Estados para el paso de contraseña
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Estados para el paso de email
  const [email, setEmail] = useState(formData.email || "");
  const [isAccepted, setIsAccepted] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Estado para SuccessStep
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);

  // LoadingTransition component
  const LoadingTransition = useMemo(() => {
    const LoadingComponent = ({ message }) => {
      const messages = [
        "Verificando información...",
        "Casi listo...",
        "Finalizando...",
      ];
      const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        }, 1000);
        return () => clearInterval(interval);
      }, [messages.length]);

      return (
        <div className="loading-transition-overlay">
          <div className="loading-transition-content">
            <div className="loading-spinner-large"></div>
            <h3 className="loading-transition-title">{message}</h3>
            <p className="loading-transition-message">
              {messages[currentMessageIndex]}
            </p>
          </div>
        </div>
      );
    };
    return LoadingComponent;
  }, []);

  // ============ HANDLERS PARA EMAIL ============
  const handleEmailSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError("Ingresá un formato de e-mail válido.");
        return;
      }
      if (!isAccepted) {
        setError("Debes aceptar los Términos y Condiciones.");
        return;
      }

      setIsCheckingEmail(true);
      setError("");

      const emailCheck = await checkEmailAvailability(
        email.trim().toLowerCase()
      );
      setIsCheckingEmail(false);

      if (!emailCheck.available) {
        setError("Este email ya está registrado. Intenta iniciar sesión.");
        return;
      }

      setFormData((prev) => ({ ...prev, email: email.trim().toLowerCase() }));
      setCurrentStep(2);
    },
    [email, isAccepted]
  );

  // ============ PASO 1: EMAIL ============
  const EmailStep = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email) && isAccepted;

    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={LogoMini}
              alt="LiftyApp Logo"
              className="logo-image logo-image-mini"
            />
          </div>
          <h1 className="auth-title">Paso 1: Tu Email</h1>
          <p className="auth-subtitle">Asegurate de tener acceso a él</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}

          <div className="auth-input-group">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <div className="auth-input-wrapper">
              <Mail className="auth-input-icon" size={20} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
                className={`auth-input ${error ? "error" : ""}`}
                placeholder="tu@email.com"
                autoFocus
              />
            </div>
          </div>

          <div
            className="checkbox-container"
            style={{ justifyContent: "center" }}
          >
            <input
              type="checkbox"
              id="terms"
              checked={isAccepted}
              onChange={(e) => setIsAccepted(e.target.checked)}
            />
            <label
              htmlFor="terms"
              style={{
                fontSize: "0.85rem",
                color: "var(--lifty-text-tertiary)",
              }}
            >
              Acepto los{" "}
              <a
                href="#"
                style={{
                  color: "var(--lifty-accent-main)",
                  textDecoration: "none",
                }}
              >
                Términos y Condiciones
              </a>
            </label>
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={!isValid || isCheckingEmail}
          >
            {isCheckingEmail ? "Verificando..." : "Continuar"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="auth-link">
              Inicia Sesión
            </Link>
          </p>
        </div>
      </div>
    );
  }, [email, isAccepted, isCheckingEmail, error, handleEmailSubmit]);

  // ============ EFECTOS PARA VALIDACIÓN DE EMAIL ============
  useEffect(() => {
    if (isCodeSent && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer, isCodeSent]);

  useEffect(() => {
    if (isCodeSent && inputsRef.current[0]) {
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }
  }, [isCodeSent]);

  // ============ HANDLERS PARA VALIDACIÓN DE EMAIL ============
  const handleSendCode = useCallback(async () => {
    setSendLoading(true);
    setError("");
    setVerificationCode("");

    const result = await requestVerificationCode(formData.email);

    setSendLoading(false);

    if (result.success) {
      setIsCodeSent(true);
      setResendTimer(90);
    } else {
      setError(result.message || "Error al enviar el código");
    }
  }, [formData.email]);

  const handleResend = useCallback(() => {
    if (resendTimer === 0) handleSendCode();
  }, [resendTimer, handleSendCode]);

  const handleConfirmCode = useCallback(
    async (e) => {
      e.preventDefault();

      if (confirmLoading || !isCodeSent) return;

      if (verificationCode.length !== 6) {
        setError("Debes ingresar un código de 6 dígitos");
        return;
      }

      setError("");
      setConfirmLoading(true);

      const result = await verifyCodeService(formData.email, verificationCode);

      setConfirmLoading(false);

      if (result.success) {
        setFormData((prev) => ({ ...prev, isEmailValidated: true }));
        setTransitionMessage("Email verificado correctamente");
        setShowTransition(true);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setShowTransition(false);
        setCurrentStep(3);
      } else {
        setError(
          result.message || "Código inválido o expirado. Intenta de nuevo."
        );
        setTimeout(() => inputsRef.current[0]?.focus(), 100);
      }
    },
    [confirmLoading, isCodeSent, verificationCode, formData.email]
  );

  const handleCodeChange = useCallback(
    (e, index) => {
      if (error) setError("");

      const value = e.target.value;
      if (value && !/^[0-9]$/.test(value)) return;

      const codeArray = verificationCode.padEnd(6, " ").split("");
      codeArray[index] = value || " ";
      const newCode = codeArray.join("").trimEnd();
      setVerificationCode(newCode);

      if (value && index < 5) {
        setTimeout(() => inputsRef.current[index + 1]?.focus(), 10);
      }
    },
    [error, verificationCode]
  );

  const handleCodeKeyDown = useCallback(
    (e, index) => {
      if (e.key === "Backspace") {
        e.preventDefault();
        const codeArray = verificationCode.padEnd(6, " ").split("");

        if (codeArray[index] && codeArray[index] !== " ") {
          codeArray[index] = " ";
          setVerificationCode(codeArray.join("").trimEnd());
        } else if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      }
    },
    [verificationCode]
  );

  // ============ PASO 2: VALIDAR EMAIL CON CÓDIGO ============
  const EmailValidationStep = useMemo(() => {
    const isCodeValid = verificationCode.length === 6;

    const renderSubtitle = () => {
      const text = isCodeSent ? (
        <>
          Ingresá el código de 6 dígitos enviado a{" "}
          <span
            style={{ fontWeight: "600", color: "var(--lifty-text-primary)" }}
          >
            {formData.email}
          </span>
        </>
      ) : (
        "Debés enviar un código de verificación a tu e-mail para continuar."
      );

      return (
        <p className="auth-subtitle" style={{ marginBottom: "1.5rem" }}>
          {text}
        </p>
      );
    };

    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={LogoMini}
              alt="LiftyApp Logo"
              className="logo-image logo-image-mini"
            />
          </div>
          <h1
            className="auth-title"
            style={{
              color: "var(--lifty-accent-main)",
              fontWeight: "700",
              fontSize: "1.8rem",
            }}
          >
            Validá tu Email
          </h1>
          {renderSubtitle()}
        </div>

        <form onSubmit={handleConfirmCode} className="auth-form">
          {/* Inputs de código de 6 dígitos */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginBottom: error ? "0.5rem" : "1.5rem",
              transition: "margin-bottom 0.3s ease",
            }}
          >
            {Array(6)
              .fill(0)
              .map((_, index) => {
                const codeArray = verificationCode.padEnd(6, " ").split("");
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
                    disabled={!isCodeSent || sendLoading || confirmLoading}
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
                      opacity: !isCodeSent ? 0.5 : 1,
                      cursor: !isCodeSent ? "not-allowed" : "text",
                    }}
                  />
                );
              })}
          </div>

          {/* Mensaje de error con animación slide-down */}
          <div
            style={{
              maxHeight: error ? "100px" : "0",
              opacity: error ? 1 : 0,
              overflow: "hidden",
              transition: "max-height 0.3s ease, opacity 0.3s ease",
              marginBottom: error ? "1rem" : "0",
            }}
          >
            {error && (
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--lifty-error)",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "0.5rem 0",
                }}
              >
                <XCircle size={14} />
                {error}
              </p>
            )}
          </div>

          {/* Sección de botones con transiciones */}
          <div
            style={{
              minHeight: isCodeSent ? "80px" : "90px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "1rem",
              marginBottom: "1rem",
            }}
          >
            {!isCodeSent ? (
              <button
                type="button"
                onClick={handleSendCode}
                className="auth-btn-primary"
                disabled={sendLoading}
                style={{ width: "100%" }}
              >
                {sendLoading ? (
                  <>
                    <span className="auth-spinner"></span>Enviando...
                  </>
                ) : (
                  <>Enviar Código</>
                )}
              </button>
            ) : (
              <div style={{ textAlign: "center", width: "100%" }}>
                {resendTimer > 0 ? (
                  <div
                    style={{
                      padding: "1rem",
                      background: "var(--lifty-bg-input)",
                      borderRadius: "8px",
                      border: "1px solid rgba(120, 130, 182, 0.1)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.95rem",
                        color: "var(--lifty-text-primary)",
                        fontWeight: "500",
                        margin: 0,
                      }}
                    >
                      Reenviar código en{" "}
                      <span
                        style={{
                          fontWeight: "700",
                          color: "var(--lifty-accent-main)",
                          fontSize: "1.1rem",
                        }}
                      >
                        {resendTimer}s
                      </span>
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={sendLoading}
                    className="auth-btn-primary"
                    style={{ width: "100%" }}
                  >
                    {sendLoading ? (
                      <>
                        <span className="auth-spinner"></span>Reenviando...
                      </>
                    ) : (
                      <>Reenviar Código</>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            <button
              type="submit"
              className="auth-btn-primary"
              disabled={!isCodeSent || confirmLoading}
            >
              {confirmLoading ? (
                <>
                  <span className="auth-spinner"></span>Validando...
                </>
              ) : (
                <>Confirmar Código</>
              )}
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="auth-btn-secondary"
              disabled={sendLoading || confirmLoading}
            >
              Volver Atrás
            </button>
          </div>
        </form>
      </div>
    );
  }, [
    verificationCode,
    isCodeSent,
    resendTimer,
    sendLoading,
    confirmLoading,
    error,
    formData.email,
    handleSendCode,
    handleResend,
    handleConfirmCode,
    handleCodeChange,
    handleCodeKeyDown,
  ]);

  // ============ HANDLERS PARA NOMBRE Y USUARIO ============
  const handleNameSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const isValid = name.trim().length >= 3 && username.trim().length >= 3;
      if (!isValid) return;

      setIsCheckingUsername(true);
      setError("");

      const usernameCheck = await checkUsernameAvailability(username.trim());
      setIsCheckingUsername(false);

      if (!usernameCheck.available) {
        setError("Este nombre de usuario ya está en uso. Intenta otro.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        name: name.trim(),
        username: username.trim(),
      }));

      setTransitionMessage("Guardando tu información");
      setShowTransition(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      setShowTransition(false);

      setCurrentStep(4);
    },
    [name, username]
  );

  // ============ PASO 3: NOMBRE ============
  const NameStep = useMemo(() => {
    const isValid = name.trim().length >= 3 && username.trim().length >= 3;

    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={LogoMini}
              alt="LiftyApp Logo"
              className="logo-image logo-image-mini"
            />
          </div>
          <h1 className="auth-title">Elegí tu nombre y usuario</h1>
          <p className="auth-subtitle">
            Se mostrarán a las personas que interactúen con vos
          </p>
        </div>

        <form onSubmit={handleNameSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}

          <div className="auth-input-group">
            <label htmlFor="name" className="auth-label">
              Nombre
            </label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={20} />
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                className={`auth-input ${error ? "error" : ""}`}
                placeholder="Tu nombre completo"
                autoFocus
                autoComplete="name"
              />
            </div>
            {name.length > 0 && name.length < 3 && (
              <span
                className="auth-error-text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "5px",
                }}
              >
                <XCircle size={14} />
                Mínimo 3 caracteres
              </span>
            )}
          </div>

          <div className="auth-input-group">
            <label htmlFor="username" className="auth-label">
              Nombre de Usuario
            </label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" size={20} />
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError("");
                }}
                className={`auth-input ${error ? "error" : ""}`}
                placeholder="@tunombredeusuario"
                autoComplete="username"
              />
            </div>
            {username.length > 0 && username.length < 3 && (
              <span
                className="auth-error-text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "5px",
                }}
              >
                <XCircle size={14} />
                Mínimo 3 caracteres
              </span>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={!isValid || isCheckingUsername}
          >
            {isCheckingUsername ? "Verificando..." : "Continuar"}
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(2)}
            className="auth-btn-secondary"
          >
            Volver Atrás
          </button>
        </form>
      </div>
    );
  }, [name, username, isCheckingUsername, error, handleNameSubmit]);

  // ============ VALIDACIONES DE CONTRASEÑA ============
  const validations = useMemo(
    () => ({
      minChars: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^a-zA-Z0-9\s]/.test(password),
    }),
    [password]
  );

  // ============ HANDLERS PARA CONTRASEÑA ============
  const handlePasswordSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const passwordsMatch =
        password === confirmPassword && password.length > 0;
      const isValid =
        Object.values(validations).every(Boolean) && passwordsMatch;
      if (!isValid) return;

      setError("");
      setTransitionMessage("Creando tu cuenta");
      setShowTransition(true);

      const result = await registerService({
        email: formData.email,
        full_name: formData.name,
        username: formData.username,
        password: password,
        // Datos del wizard
        gender: wizardData.gender,
        weight: wizardData.weight,
        height: wizardData.height,
        lifestyle: wizardData.lifestyle,
        diet: wizardData.diet,
        goal: wizardData.mainGoal,
        meals: wizardData.mealFrequency,
      });

      setShowTransition(false);

      if (result.success) {
        // Limpiar wizard data después de registro exitoso
        localStorage.removeItem("wizardData");
        // Marcar como usuario nuevo para mostrar el modal de rutina IA
        localStorage.setItem("isNewUser", "true");
        updateUser(result.data.user);
        setFormData((prev) => ({ ...prev, password }));
        setCurrentStep(5);
      } else {
        setError(result.message || "Error al crear la cuenta");
      }
    },
    [
      password,
      confirmPassword,
      validations,
      formData.email,
      formData.name,
      formData.username,
      updateUser,
    ]
  );

  // ============ PASO 4: CONTRASEÑA ============
  const PasswordStep = useMemo(() => {
    const passwordsMatch = password === confirmPassword && password.length > 0;
    const isValid = Object.values(validations).every(Boolean) && passwordsMatch;

    const ValidationItem = ({ label, isValid }) => (
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.4rem",
          fontSize: "0.8rem",
          color: isValid
            ? "var(--lifty-accent-main)"
            : "var(--lifty-text-tertiary)",
          fontWeight: isValid ? "600" : "400",
          transition: "all 0.2s ease",
        }}
      >
        {isValid ? (
          <CheckCircle
            size={14}
            color="var(--lifty-accent-main)"
            style={{ flexShrink: 0, marginTop: "1px" }}
          />
        ) : (
          <XCircle size={14} style={{ flexShrink: 0, marginTop: "1px" }} />
        )}
        <span style={{ flex: 1, lineHeight: "1.2" }}>{label}</span>
      </div>
    );

    return (
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <img
              src={LogoMini}
              alt="LiftyApp Logo"
              className="logo-image logo-image-mini"
            />
          </div>
          <h1 className="auth-title">Creá tu contraseña</h1>
          <p className="auth-subtitle">Mantendrás tu cuenta protegida</p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="auth-form">
          {error && <div className="auth-error-banner">{error}</div>}

          <div className="auth-input-group" style={{ marginBottom: "0.75rem" }}>
            <label
              htmlFor="password"
              className="auth-label"
              style={{ marginBottom: "0.5rem" }}
            >
              Contraseña
            </label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
                className="auth-input"
                placeholder="Escribí tu contraseña"
                autoFocus
                autoComplete="new-password"
              />
              <button
                type="button"
                className="auth-toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{ transition: "color 0.2s ease" }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="auth-input-group" style={{ marginBottom: "1.5rem" }}>
            <label
              htmlFor="confirmPassword"
              className="auth-label"
              style={{ marginBottom: "0.5rem" }}
            >
              Confirmar Contraseña
            </label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
                placeholder="Repetí la contraseña"
                autoComplete="new-password"
              />
            </div>
            {confirmPassword.length > 0 && !passwordsMatch && (
              <span
                className="auth-error-text"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  marginTop: "5px",
                }}
              >
                <XCircle size={14} />
                Las contraseñas no coinciden
              </span>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.8rem 1rem",
              marginBottom: "2rem",
              marginTop: "0.75rem",
            }}
          >
            <ValidationItem
              label="Mínimo 8 caracteres"
              isValid={validations.minChars}
            />
            <ValidationItem
              label="Una mayúscula"
              isValid={validations.hasUpper}
            />
            <ValidationItem label="Un número" isValid={validations.hasNumber} />
            <ValidationItem
              label="Un carácter personalizado"
              isValid={validations.hasSpecial}
            />
          </div>

          <button
            type="submit"
            className="auth-btn-primary"
            disabled={!isValid}
          >
            Guardar y continuar
          </button>
          <button
            type="button"
            onClick={() => setCurrentStep(3)}
            className="auth-btn-secondary"
          >
            Volver Atrás
          </button>
        </form>
      </div>
    );
  }, [
    password,
    confirmPassword,
    showPassword,
    validations,
    error,
    handlePasswordSubmit,
  ]);

  // ============ PASO 5: SUCCESS ============
  const SuccessStep = useMemo(() => {
    const welcomeMessage = `Bienvenido/a, ${formData.name}. Tu cuenta ha sido creada y tus credenciales han sido validadas.`;

    return (
      <div className="auth-card">
        <div className="auth-header">
          <CheckCircle
            size={60}
            style={{
              color: "var(--lifty-accent-main)",
              margin: "0 auto 1rem",
              animation: "pulse 2s ease-in-out infinite",
            }}
          />
          <p
            className="auth-subtitle"
            style={{ lineHeight: "1.6", fontSize: "1rem", marginTop: "1rem" }}
          >
            {welcomeMessage}
          </p>
        </div>

        <div
          style={{
            height: "2px",
            background:
              "linear-gradient(to right, transparent, var(--lifty-accent-ultra-light), transparent)",
            margin: "1.5rem 0",
          }}
        ></div>

        <div
          style={{
            background: "var(--lifty-bg-input)",
            border: "1px solid rgba(120, 130, 182, 0.08)",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "1.5rem",
            transition: "all 0.3s ease",
          }}
        >
          <h3
            style={{
              fontSize: "0.9rem",
              fontWeight: "600",
              color: "var(--lifty-accent-main)",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              borderBottom: "2px solid var(--lifty-accent-ultra-light)",
              paddingBottom: "0.5rem",
            }}
          >
            <User size={18} /> Tus datos de usuario
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "85px 1fr",
              gap: "0.5rem",
              fontSize: "0.8rem",
              alignItems: "center",
            }}
          >
            <span
              style={{ color: "var(--lifty-text-tertiary)", fontWeight: "500" }}
            >
              Email:
            </span>
            <span
              style={{
                fontWeight: "600",
                color: "var(--lifty-text-primary)",
                textAlign: "left",
                wordBreak: "break-word",
                fontSize: "0.75rem",
              }}
            >
              {formData.email}
            </span>

            <span
              style={{ color: "var(--lifty-text-tertiary)", fontWeight: "500" }}
            >
              Nombre:
            </span>
            <span
              style={{
                fontWeight: "600",
                color: "var(--lifty-text-primary)",
                textAlign: "left",
              }}
            >
              {formData.name}
            </span>

            <span
              style={{ color: "var(--lifty-text-tertiary)", fontWeight: "500" }}
            >
              Usuario:
            </span>
            <span
              style={{
                fontWeight: "600",
                color: "var(--lifty-text-primary)",
                textAlign: "left",
              }}
            >
              {formData.username}
            </span>

            <span
              style={{ color: "var(--lifty-text-tertiary)", fontWeight: "500" }}
            >
              Contraseña:
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                justifyContent: "flex-start",
              }}
            >
              <span
                style={{
                  fontWeight: "600",
                  color: "var(--lifty-text-primary)",
                }}
              >
                {showPasswordSuccess ? formData.password : "••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordSuccess(!showPasswordSuccess)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--lifty-text-tertiary)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: "2px",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--lifty-accent-main)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--lifty-text-tertiary)")
                }
              >
                {showPasswordSuccess ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              navigate("/login");
            }}
            className="auth-btn-primary"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            Ir a Iniciar Sesión
          </button>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
              navigate("/");
            }}
            className="auth-btn-secondary"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }, [
    formData.name,
    formData.email,
    formData.username,
    formData.password,
    showPasswordSuccess,
    navigate,
  ]);

  // Render del paso actual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return EmailStep;
      case 2:
        return EmailValidationStep;
      case 3:
        return NameStep;
      case 4:
        return PasswordStep;
      case 5:
        return SuccessStep;
      default:
        return EmailStep;
    }
  };

  return (
    <div className="auth-container">
      <SimpleHeader />
      {showTransition ? (
        <LoadingTransition message={transitionMessage} />
      ) : (
        renderStep()
      )}
    </div>
  );
};

export default Register;
