import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Apple, TrendingUp, UtensilsCrossed, Flame, Droplet, X } from "lucide-react";
import { getDailyGoalsByDate } from "../../services/dailyGoalsService";
import { getConsumedMealsByDate } from "../../services/consumedMealsService";
import "./MealsCalendar.css";

const MealsCalendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [daysData, setDaysData] = useState({}); // Almacenar datos de cumplimiento por día

  // Cargar datos del mes cuando cambia
  useEffect(() => {
    loadMonthData();
  }, [currentDate]);

  const loadMonthData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const monthData = {};

    // Cargar datos de cada día del mes (solo días pasados)
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      if (date <= today) {
        const dateKey = date.toISOString().split("T")[0];
        try {
          const [goalsResult, mealsResult] = await Promise.all([
            getDailyGoalsByDate(dateKey),
            getConsumedMealsByDate(dateKey),
          ]);

          if (goalsResult.data) {
            const goals = goalsResult.data;
            const consumed = goals.calories_consumed || mealsResult.data?.totals?.calories || 0;
            const target = goals.calories_goal;
            const percentage = target > 0 ? (consumed / target) * 100 : 0;

            monthData[dateKey] = {
              hasData: consumed > 0,
              percentage: percentage,
              status: getStatusFromPercentage(percentage),
            };
          } else {
            monthData[dateKey] = { hasData: false, percentage: 0, status: 'no-data' };
          }
        } catch (error) {
          monthData[dateKey] = { hasData: false, percentage: 0, status: 'no-data' };
        }
      }
    }

    setDaysData(monthData);
  };

  const getStatusFromPercentage = (percentage) => {
    if (percentage === 0) return 'no-data';
    if (percentage >= 75 && percentage <= 110) return 'complete'; // Verde: 75%-110%
    if (percentage >= 50) return 'partial'; // Amarillo: 50%-74% o >110%
    return 'incomplete'; // Rojo: <50%
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

  const isFutureDate = (day) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    return date > today;
  };

  const handleDayClick = async (day) => {
    if (isFutureDate(day)) return;

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, day);
    const dateKey = date.toISOString().split("T")[0];

    setSelectedDate(dateKey);
    setIsLoading(true);
    setShowDetailsModal(true);

    try {
      const [goalsResult, mealsResult] = await Promise.all([
        getDailyGoalsByDate(dateKey),
        getConsumedMealsByDate(dateKey),
      ]);

      setSelectedData({
        goals: goalsResult.data,
        meals: mealsResult.data?.consumed || [],
        totals: mealsResult.data?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 },
      });
    } catch (error) {
      console.error("Error al cargar datos del día:", error);
    } finally {
      setIsLoading(false);
    }
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
      const today = isToday(day);
      const future = isFutureDate(day);
      
      // Obtener datos del día
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const date = new Date(year, month, day);
      const dateKey = date.toISOString().split("T")[0];
      const dayData = daysData[dateKey] || { hasData: false, status: 'no-data' };

      days.push(
        <div
          key={day}
          className={`calendar-day ${today ? "today" : ""} ${future ? "future" : "clickable"}`}
          onClick={() => !future && handleDayClick(day)}
        >
          <span className="day-number">{day}</span>
          {!future && (
            <div className={`day-indicator ${dayData.status}`}>
              <Apple size={14} strokeWidth={2.5} />
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
    setDaysData({}); // Limpiar datos al cambiar de mes
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const closeModal = () => {
    setShowDetailsModal(false);
    setSelectedDate(null);
    setSelectedData(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="meals-calendar-page">
      <div className="calendar-container">
        {/* Header */}
        <div className="calendar-header">
          <button
            className="lifty-back-btn"
            onClick={() => navigate("/meals?tab=meta-diaria")}
            aria-label="Volver"
          >
            <ArrowLeft size={24} strokeWidth={2} />
          </button>
          <h1 className="calendar-page-title">
            <Calendar size={28} strokeWidth={2} />
            Calendario de Meta Diaria
          </h1>
        </div>

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

        {/* Legend */}
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-indicator today-indicator"></div>
            <span>Hoy</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator complete-indicator">
              <Apple size={12} strokeWidth={2.5} />
            </div>
            <span>Meta cumplida (75-110%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator partial-indicator">
              <Apple size={12} strokeWidth={2.5} />
            </div>
            <span>Progreso parcial (50-74%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator incomplete-indicator">
              <Apple size={12} strokeWidth={2.5} />
            </div>
            <span>Por debajo (&lt;50%)</span>
          </div>
          <div className="legend-item">
            <div className="legend-indicator no-data-indicator">
              <Apple size={12} strokeWidth={2.5} />
            </div>
            <span>Sin datos</span>
          </div>
        </div>
      </div>

      {/* Modal de Detalles */}
      {showDetailsModal && (
        <div className="details-modal-overlay" onClick={closeModal}>
          <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="details-modal-header">
              <h2>{selectedDate && formatDate(selectedDate)}</h2>
              <button className="close-modal-btn" onClick={closeModal}>
                <X size={24} strokeWidth={2} />
              </button>
            </div>

            {isLoading ? (
              <div className="modal-loading">
                <p>Cargando...</p>
              </div>
            ) : selectedData?.goals ? (
              <div className="details-modal-body">
                {/* Metas y Consumido */}
                <div className="goals-section">
                  <h3>Resumen del Día</h3>
                  <div className="goals-grid">
                    {/* Calorías */}
                    <div className="goal-detail-card">
                      <div className="goal-detail-header">
                        <Flame size={20} strokeWidth={2.5} className="goal-icon calories" />
                        <span className="goal-name">Calorías</span>
                      </div>
                      <div className="goal-detail-values">
                        <span className="consumed">{Math.floor(selectedData.goals.calories_consumed || selectedData.totals.calories)}</span>
                        <span className="separator">/</span>
                        <span className="target">{selectedData.goals.calories_goal}</span>
                        <span className="unit">kcal</span>
                      </div>
                      <div className="goal-detail-progress">
                        <div
                          className="progress-bar-fill calories"
                          style={{
                            width: `${Math.min(
                              ((selectedData.goals.calories_consumed || selectedData.totals.calories) /
                                selectedData.goals.calories_goal) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Proteínas */}
                    <div className="goal-detail-card">
                      <div className="goal-detail-header">
                        <UtensilsCrossed size={20} strokeWidth={2.5} className="goal-icon protein" />
                        <span className="goal-name">Proteínas</span>
                      </div>
                      <div className="goal-detail-values">
                        <span className="consumed">{Math.floor(selectedData.goals.protein_consumed || selectedData.totals.protein)}</span>
                        <span className="separator">/</span>
                        <span className="target">{selectedData.goals.protein_goal}</span>
                        <span className="unit">g</span>
                      </div>
                      <div className="goal-detail-progress">
                        <div
                          className="progress-bar-fill protein"
                          style={{
                            width: `${Math.min(
                              ((selectedData.goals.protein_consumed || selectedData.totals.protein) /
                                selectedData.goals.protein_goal) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Carbohidratos */}
                    <div className="goal-detail-card">
                      <div className="goal-detail-header">
                        <Apple size={20} strokeWidth={2.5} className="goal-icon carbs" />
                        <span className="goal-name">Carbohidratos</span>
                      </div>
                      <div className="goal-detail-values">
                        <span className="consumed">{Math.floor(selectedData.goals.carbs_consumed || selectedData.totals.carbs)}</span>
                        <span className="separator">/</span>
                        <span className="target">{selectedData.goals.carbs_goal}</span>
                        <span className="unit">g</span>
                      </div>
                      <div className="goal-detail-progress">
                        <div
                          className="progress-bar-fill carbs"
                          style={{
                            width: `${Math.min(
                              ((selectedData.goals.carbs_consumed || selectedData.totals.carbs) /
                                selectedData.goals.carbs_goal) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Grasas */}
                    <div className="goal-detail-card">
                      <div className="goal-detail-header">
                        <TrendingUp size={20} strokeWidth={2.5} className="goal-icon fats" />
                        <span className="goal-name">Grasas</span>
                      </div>
                      <div className="goal-detail-values">
                        <span className="consumed">{Math.floor(selectedData.goals.fats_consumed || selectedData.totals.fats)}</span>
                        <span className="separator">/</span>
                        <span className="target">{selectedData.goals.fats_goal}</span>
                        <span className="unit">g</span>
                      </div>
                      <div className="goal-detail-progress">
                        <div
                          className="progress-bar-fill fats"
                          style={{
                            width: `${Math.min(
                              ((selectedData.goals.fats_consumed || selectedData.totals.fats) /
                                selectedData.goals.fats_goal) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Agua */}
                    <div className="goal-detail-card">
                      <div className="goal-detail-header">
                        <Droplet size={20} strokeWidth={2.5} className="goal-icon water" />
                        <span className="goal-name">Agua</span>
                      </div>
                      <div className="goal-detail-values">
                        <span className="consumed">{Number(selectedData.goals.water_consumed || 0).toFixed(1)}</span>
                        <span className="separator">/</span>
                        <span className="target">{selectedData.goals.water_goal}</span>
                        <span className="unit">L</span>
                      </div>
                      <div className="goal-detail-progress">
                        <div
                          className="progress-bar-fill water"
                          style={{
                            width: `${Math.min(
                              ((selectedData.goals.water_consumed || 0) / selectedData.goals.water_goal) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comidas Consumidas */}
                <div className="meals-section">
                  <h3>Comidas Consumidas</h3>
                  {selectedData.meals.length === 0 ? (
                    <p className="no-meals">No se registraron comidas este día</p>
                  ) : (
                    <div className="meals-list">
                      {selectedData.meals.map((meal) => (
                        <div key={meal.id_consumed} className="meal-detail-card">
                          {meal.image_url && (
                            <div className="meal-image">
                              <img src={meal.image_url} alt={meal.name} />
                            </div>
                          )}
                          <div className="meal-info">
                            <h4>{meal.name}</h4>
                            <div className="meal-macros">
                              <span><Flame size={14} /> {meal.calories} kcal</span>
                              <span>P: {meal.protein}g</span>
                              <span>C: {meal.carbs}g</span>
                              <span>F: {meal.fats}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="modal-empty">
                <Apple size={48} strokeWidth={1.5} style={{ opacity: 0.3 }} />
                <p>No hay datos registrados para este día</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsCalendar;
