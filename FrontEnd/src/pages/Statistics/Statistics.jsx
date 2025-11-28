import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BarChart2 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useAuth } from "../../context/AuthContext";
import { getUserStats } from "../../services/usersService";
import "./Statistics.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statType, setStatType] = useState("duration");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(
    async (type) => {
      if (!user?.id_user) return;

      setLoading(true);
      try {
        const result = await getUserStats(user.id_user, type);
        if (result.success && result.data) {
          // Formatear datos para recharts
          const formattedData = result.data.map((item) => ({
            date: formatDate(item.date),
            value: item.value,
          }));
          setData(formattedData);
        } else {
          setData([]);
        }
      } catch (error) {
        console.error("Error loading stats:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.id_user]
  );

  useEffect(() => {
    loadStats(statType);
  }, [statType, loadStats]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return `${day}/${month}`;
  };

  const getLabel = () => {
    switch (statType) {
      case "duration":
        return "Duración (min)";
      case "volume":
        return "Volumen (kg)";
      case "reps":
        return "Repeticiones";
      default:
        return "";
    }
  };

  const getTitle = () => {
    switch (statType) {
      case "duration":
        return "Duración de Entrenamientos";
      case "volume":
        return "Volumen Total";
      case "reps":
        return "Repeticiones Totales";
      default:
        return "Estadísticas";
    }
  };

  return (
    <div className="statistics-page">
      {/* HERO SECTION */}
      <div className="statistics-hero">
        <button className="back-button" onClick={() => navigate("/profile")}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="statistics-hero-title">ESTADÍSTICAS</h1>
      </div>

      {/* MAIN CONTENT */}
      <div className="statistics-content">
        <div className="stats-header">
          <h2 className="stats-title">{getTitle()}</h2>
          <p className="stats-period">Última semana</p>
        </div>

        {/* FILTROS */}
        <div className="stats-filters">
          <button
            className={`filter-chip ${statType === "duration" ? "active" : ""}`}
            onClick={() => setStatType("duration")}
          >
            Duración
          </button>
          <button
            className={`filter-chip ${statType === "volume" ? "active" : ""}`}
            onClick={() => setStatType("volume")}
          >
            Volumen
          </button>
          <button
            className={`filter-chip ${statType === "reps" ? "active" : ""}`}
            onClick={() => setStatType("reps")}
          >
            Reps
          </button>
        </div>

        {/* GRÁFICA */}
        <div className="stats-chart-container">
          {loading ? (
            <div className="stats-loading">
              <BarChart2 size={48} className="loading-icon" />
              <p>Cargando estadísticas...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="stats-empty">
              <BarChart2 size={48} className="empty-icon" />
              <p>Sin datos en este período</p>
              <span className="empty-hint">
                Completa entrenamientos para ver tus estadísticas
              </span>
            </div>
          ) : (
            <Line
              data={{
                labels: data.map((item) => item.date),
                datasets: [
                  {
                    label: getLabel(),
                    data: data.map((item) => item.value),
                    borderColor: "rgb(120, 130, 182)",
                    backgroundColor: "rgba(120, 130, 182, 0.1)",
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: "rgb(120, 130, 182)",
                    pointBorderColor: "#fff",
                    pointBorderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    titleColor: "#9ca3af",
                    bodyColor: "#7882b6",
                    borderColor: "rgba(120, 130, 182, 0.2)",
                    borderWidth: 1,
                    padding: 12,
                    bodyFont: {
                      size: 16,
                      weight: "bold",
                    },
                    titleFont: {
                      size: 13,
                    },
                    displayColors: false,
                  },
                },
                scales: {
                  x: {
                    grid: {
                      color: "rgba(120, 130, 182, 0.1)",
                      drawBorder: false,
                    },
                    ticks: {
                      color: "#9ca3af",
                      font: {
                        size: 12,
                      },
                    },
                  },
                  y: {
                    grid: {
                      color: "rgba(120, 130, 182, 0.1)",
                      drawBorder: false,
                    },
                    ticks: {
                      color: "#9ca3af",
                      font: {
                        size: 12,
                      },
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          )}
        </div>

        {/* RESUMEN */}
        {!loading && data.length > 0 && (
          <div className="stats-summary">
            <div className="summary-item">
              <span className="summary-label">Total</span>
              <span className="summary-value">
                {data.reduce((acc, item) => acc + item.value, 0).toFixed(0)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Promedio</span>
              <span className="summary-value">
                {(
                  data.reduce((acc, item) => acc + item.value, 0) / data.length
                ).toFixed(1)}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Días</span>
              <span className="summary-value">{data.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
