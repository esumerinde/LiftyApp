import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Dumbbell, TrendingUp } from "lucide-react";
import { getMyWorkoutLogs } from "../../services/workoutLogsService";
import "./WorkoutCalendar.css";

const WorkoutCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDates, setWorkoutDates] = useState(new Set());
  const [workoutsByDate, setWorkoutsByDate] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    thisMonth: 0,
    total: 0,
    streak: 0,
  });

  useEffect(() => {
    loadWorkoutLogs();
  }, []);

  const loadWorkoutLogs = async () => {
    setIsLoading(true);
    try {
      const result = await getMyWorkoutLogs();
      if (result.success && Array.isArray(result.data)) {
        const dates = new Set();
        const byDate = {};

        result.data.forEach((log) => {
          const date = new Date(log.log_date);
          const dateKey = date.toISOString().split("T")[0];
          dates.add(dateKey);

          if (!byDate[dateKey]) {
            byDate[dateKey] = [];
          }
          byDate[dateKey].push(log);
        });

        setWorkoutDates(dates);
        setWorkoutsByDate(byDate);
        calculateStats(result.data);
      }
    } catch (error) {
      console.error("Error cargando entrenamientos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (logs) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthCount = logs.filter((log) => {
      const logDate = new Date(log.log_date);
      return (
        logDate.getMonth() === currentMonth &&
        logDate.getFullYear() === currentYear
      );
    }).length;

    // Calcular racha actual
    const sortedLogs = logs
      .map((log) => new Date(log.log_date))
      .sort((a, b) => b - a);

    let streak = 0;
    let currentStreakDate = new Date();
    currentStreakDate.setHours(0, 0, 0, 0);

    for (const logDate of sortedLogs) {
      const logDay = new Date(logDate);
      logDay.setHours(0, 0, 0, 0);

      const diffDays = Math.floor(
        (currentStreakDate - logDay) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        currentStreakDate = logDay;
      } else {
        break;
      }
    }

    setStats({
      thisMonth: thisMonthCount,
      total: logs.length,
      streak: streak,
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const hasWorkoutOnDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split("T")[0];
    return workoutDates.has(dateKey);
  };

  const getWorkoutsForDate = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split("T")[0];
    return workoutsByDate[dateKey] || [];
  };

  const isToday = (day) => {
    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      const hasWorkout = hasWorkoutOnDate(day);
      const today = isToday(day);
      const workouts = getWorkoutsForDate(day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${hasWorkout ? "has-workout" : ""} ${
            today ? "today" : ""
          }`}
          title={
            hasWorkout
              ? `${workouts.length} entrenamiento${
                  workouts.length > 1 ? "s" : ""
                }`
              : ""
          }
        >
          <span className="day-number">{day}</span>
          {hasWorkout && (
            <div className="workout-indicator">
              <Dumbbell size={14} strokeWidth={2.5} />
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  return (
    <div className="workout-calendar-page">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <button
            className="lifty-back-btn"
            onClick={() => navigate("/profile")}
            aria-label="Volver"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <h1 className="calendar-page-title">
            <Calendar size={28} strokeWidth={2} />
            Calendario de Entrenamientos
          </h1>
        </div>

        {/* Stats Cards */}
        {!isLoading && (
          <div className="calendar-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <Calendar size={24} strokeWidth={2} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.thisMonth}</span>
                <span className="stat-label">Este mes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Dumbbell size={24} strokeWidth={2} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} strokeWidth={2} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.streak}</span>
                <span className="stat-label">Racha (días)</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Navigation */}
        <div className="calendar-nav">
          <button
            className="nav-btn"
            onClick={() => changeMonth(-1)}
            aria-label="Mes anterior"
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </button>
          <h2 className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            className="nav-btn"
            onClick={() => changeMonth(1)}
            aria-label="Mes siguiente"
          >
            <ArrowLeft
              size={20}
              strokeWidth={2}
              style={{ transform: "rotate(180deg)" }}
            />
          </button>
        </div>

        {/* Calendar Grid */}
        {isLoading ? (
          <div className="calendar-loading">
            <div className="loading-spinner"></div>
            <p>Cargando calendario...</p>
          </div>
        ) : (
          <div className="calendar-wrapper">
            {/* Week days header */}
            <div className="calendar-weekdays">
              {weekDays.map((day) => (
                <div key={day} className="weekday-label">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="calendar-grid">{renderCalendar()}</div>
          </div>
        )}

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-indicator today-indicator"></div>
            <span>Hoy</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator workout-indicator-legend">
              <Dumbbell size={12} strokeWidth={2.5} />
            </div>
            <span>Día entrenado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutCalendar;
