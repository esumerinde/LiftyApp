import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  UtensilsCrossed,
  Apple,
  Target,
  Pizza,
  Flame,
  Droplet,
  Plus,
  Edit2,
  Trash2,
  X,
  GlassWater,
  Coffee,
  Milk,
  RotateCcw,
  Calendar,
  Beef,
  Fish,
  Egg,
  Drumstick,
  Salad,
  Sandwich,
  IceCream,
  Cookie,
  Banana,
  Soup,
  CakeSlice,
  Croissant,
} from "lucide-react";
import DietCard from "../../components/DietCard/DietCard";
import Toast from "../../components/Toast/Toast";
import {
  getUserDailyGoals,
  addWater as addWaterService,
  resetWater as resetWaterService,
  saveDailySnapshot,
} from "../../services/dailyGoalsService";
import {
  getUserMeals,
  createMeal,
  updateMeal,
  deleteMeal,
} from "../../services/mealsService";
import {
  getTodayConsumedMeals,
  addConsumedMeal,
  deleteConsumedMeal,
} from "../../services/consumedMealsService";
import {
  getUserDiets,
  createDiet,
  deleteDiet as deleteDietService,
  activateDiet,
} from "../../services/dietsService";
import "./Meals.css";

const Meals = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "dietas"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [dailyGoals, setDailyGoals] = useState(null);
  const [loadingGoals, setLoadingGoals] = useState(false);

  // Estados para dietas
  const [diets, setDiets] = useState([]);
  const [loadingDiets, setLoadingDiets] = useState(false);

  // Estados para comidas
  const [meals, setMeals] = useState([]);
  const [loadingMeals, setLoadingMeals] = useState(false);
  const [showMealForm, setShowMealForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [searchMeal, setSearchMeal] = useState("");
  const [mealFormData, setMealFormData] = useState({
    name: "",
    calories: "",
    protein: "",
    carbs: "",
    fats: "",
    icon: "UtensilsCrossed", // Icono por defecto
  });

  // Iconos predeterminados disponibles
  const availableIcons = [
    { name: "UtensilsCrossed", component: UtensilsCrossed, label: "Cubiertos" },
    { name: "Apple", component: Apple, label: "Manzana" },
    { name: "Pizza", component: Pizza, label: "Pizza" },
    { name: "Coffee", component: Coffee, label: "Café" },
    { name: "Milk", component: Milk, label: "Leche" },
    { name: "Beef", component: Beef, label: "Carne" },
    { name: "Fish", component: Fish, label: "Pescado" },
    { name: "Egg", component: Egg, label: "Huevo" },
    { name: "Drumstick", component: Drumstick, label: "Pollo" },
    { name: "Salad", component: Salad, label: "Ensalada" },
    { name: "Sandwich", component: Sandwich, label: "Sándwich" },
    { name: "IceCream", component: IceCream, label: "Helado" },
    { name: "Cookie", component: Cookie, label: "Galleta" },
    { name: "Banana", component: Banana, label: "Banana" },
    { name: "Soup", component: Soup, label: "Sopa" },
    { name: "CakeSlice", component: CakeSlice, label: "Pastel" },
    { name: "Croissant", component: Croissant, label: "Croissant" },
  ];

  // Estados para comidas consumidas
  const [consumedMeals, setConsumedMeals] = useState([]);
  const [consumedTotals, setConsumedTotals] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
  });
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [loadingConsumed, setLoadingConsumed] = useState(false);
  const [selectorSearch, setSelectorSearch] = useState("");
  const [toast, setToast] = useState(null);

  // Cargar metas diarias cuando se cambia a la pestaña meta-diaria
  useEffect(() => {
    if (activeTab === "meta-diaria") {
      checkAndResetDay();
      loadDailyGoals();
      loadConsumedMeals();
      loadMeals(); // Cargar comidas para el selector
    } else if (activeTab === "comidas") {
      loadMeals();
    } else if (activeTab === "dietas") {
      loadDiets();
    }
  }, [activeTab]);

  // Verificar si es un nuevo día
  const checkAndResetDay = async () => {
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastDailyGoalsDate");

    if (lastDate && lastDate !== today) {
      // Es un nuevo día, guardar snapshot del día anterior
      await saveDailySnapshot();
      localStorage.setItem("lastDailyGoalsDate", today);
    } else if (!lastDate) {
      // Primera vez que se usa
      localStorage.setItem("lastDailyGoalsDate", today);
    }
  };

  const loadDailyGoals = async () => {
    setLoadingGoals(true);
    const result = await getUserDailyGoals();
    if (result.success) {
      setDailyGoals(result.data);
    }
    setLoadingGoals(false);
  };

  const loadMeals = async () => {
    setLoadingMeals(true);
    const result = await getUserMeals();
    if (result.success) {
      setMeals(result.data);
    }
    setLoadingMeals(false);
  };

  const loadDiets = async () => {
    setLoadingDiets(true);
    const result = await getUserDiets();
    if (result.success) {
      setDiets(result.data);
    }
    setLoadingDiets(false);
  };

  const loadConsumedMeals = async () => {
    setLoadingConsumed(true);
    const result = await getTodayConsumedMeals();
    if (result.success) {
      setConsumedMeals(result.data.consumed);
      setConsumedTotals(result.data.totals);
    }
    setLoadingConsumed(false);
  };

  const handleAddConsumedMeal = async (mealId) => {
    const result = await addConsumedMeal(mealId);
    if (result.success) {
      await loadConsumedMeals();
      setShowMealSelector(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert(result.error || "Error al agregar comida");
    }
  };

  const handleRemoveConsumedMeal = async (consumedId) => {
    const result = await deleteConsumedMeal(consumedId);
    if (result.success) {
      await loadConsumedMeals();
    } else {
      alert(result.error || "Error al eliminar comida");
    }
  };

  const handleAddWater = async (liters) => {
    const result = await addWaterService(liters);
    if (result.success) {
      await loadDailyGoals();
    } else {
      alert(result.error || "Error al agregar agua");
    }
  };

  const handleResetWater = async () => {
    const result = await resetWaterService();
    if (result.success) {
      await loadDailyGoals();
    } else {
      alert(result.error || "Error al resetear agua");
    }
  };

  // Handlers para Dietas
  const handleActivateDiet = async (dietId) => {
    const result = await activateDiet(dietId);
    if (result.success) {
      setToast({
        message: result.message || "Dieta activada exitosamente",
        type: "success",
      });
      await loadDiets(); // Recargar dietas para actualizar estado
      await loadDailyGoals(); // Recargar metas diarias
    } else {
      setToast({
        message: result.message || "Error al activar la dieta",
        type: "error",
      });
    }
  };

  const handleDeleteDiet = async (dietId) => {
    const result = await deleteDietService(dietId);
    if (result.success) {
      await loadDiets();
    } else {
      alert(result.message || "Error al eliminar la dieta");
    }
  };

  const handleCreateDiet = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/diets/new");
  };

  const handleMealFormChange = (e) => {
    setMealFormData({
      ...mealFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitMeal = async (e) => {
    e.preventDefault();

    const mealData = {
      name: mealFormData.name,
      calories: parseInt(mealFormData.calories),
      protein: parseFloat(mealFormData.protein),
      carbs: parseFloat(mealFormData.carbs),
      fats: parseFloat(mealFormData.fats),
      icon: mealFormData.icon,
    };

    console.log("Enviando datos:", mealData);

    let result;
    if (editingMeal) {
      result = await updateMeal(editingMeal.id_meal, mealData);
    } else {
      result = await createMeal(mealData);
    }

    console.log("Resultado:", result);

    if (result.success) {
      setShowMealForm(false);
      setEditingMeal(null);
      setMealFormData({
        name: "",
        calories: "",
        protein: "",
        carbs: "",
        fats: "",
        icon: "UtensilsCrossed",
      });
      loadMeals();
    } else {
      alert("Error al guardar: " + (result.error || "Error desconocido"));
    }
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setMealFormData({
      name: meal.name,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fats: meal.fats.toString(),
      icon: meal.icon || "UtensilsCrossed",
    });
    setShowMealForm(true);
  };

  const handleDeleteMeal = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta comida?")) {
      const result = await deleteMeal(id);
      if (result.success) {
        loadMeals();
      }
    }
  };

  const handleCancelForm = () => {
    setShowMealForm(false);
    setEditingMeal(null);
    setMealFormData({
      name: "",
      calories: "",
      protein: "",
      carbs: "",
      fats: "",
      icon: "UtensilsCrossed",
    });
  };

  // Actualizar tab desde URL
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["dietas", "meta-diaria", "comidas"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const filters = [
    { id: "all", label: "Todas" },
    { id: "my-meals", label: "Mis Dietas" },
  ];

  // Filter diets by search
  const filteredDiets = diets.filter((diet) =>
    diet.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGoToMealHub = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/meal-hub");
  };

  return (
    <div className="home-page">
      {/* ========== TABS ========== */}
      <div className="home-tabs">
        <button
          className={`home-tab ${activeTab === "dietas" ? "active" : ""}`}
          onClick={() => setActiveTab("dietas")}
        >
          <UtensilsCrossed size={20} strokeWidth={2} />
          <span>Dietas</span>
        </button>
        <button
          className={`home-tab ${activeTab === "meta-diaria" ? "active" : ""}`}
          onClick={() => setActiveTab("meta-diaria")}
        >
          <Target size={20} strokeWidth={2} />
          <span>Meta Diaria</span>
        </button>
        <button
          className={`home-tab ${activeTab === "comidas" ? "active" : ""}`}
          onClick={() => setActiveTab("comidas")}
        >
          <Pizza size={20} strokeWidth={2} />
          <span>Comidas</span>
        </button>
      </div>

      {/* ========== HERO SECTION ========== */}
      <div className="home-hero">
        <h1 className="home-title">
          {activeTab === "dietas"
            ? "Mis Dietas"
            : activeTab === "meta-diaria"
            ? "Meta Diaria"
            : "Comidas"}
        </h1>
        <p className="home-subtitle">
          {activeTab === "dietas"
            ? "Descubre planes alimenticios personalizados para alcanzar tus objetivos"
            : activeTab === "meta-diaria"
            ? "Seguimiento de tu consumo calórico y macronutrientes"
            : "Explora y registra tus comidas del día"}
        </p>
      </div>

      {/* ========== CONTENT BY TAB ========== */}
      {activeTab === "dietas" ? (
        <div className="lifty-page">
          {/* ========== HEADER STICKY ========== */}
          <header
            className="lifty-header"
            style={{ position: "relative", top: 0 }}
          >
            {/* Search Bar */}
            <div className="lifty-search-container">
              <Search className="lifty-search-icon" size={20} strokeWidth={2} />
              <input
                type="search"
                className="lifty-search-input"
                placeholder="Buscar dietas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Chips */}
            <div className="lifty-filter-chips-container">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  className={`lifty-filter-chip ${
                    activeFilter === filter.id ? "active" : ""
                  }`}
                  onClick={() => setActiveFilter(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </header>

          {/* ========== CONTENT ========== */}
          <main className="lifty-content">
            {loadingDiets ? (
              <div className="lifty-empty-state">
                <p>Cargando dietas...</p>
              </div>
            ) : filteredDiets.length === 0 ? (
              // Empty State
              <div className="lifty-empty-state">
                <UtensilsCrossed
                  className="lifty-empty-state-icon"
                  size={64}
                  strokeWidth={1.5}
                />
                <h2 className="lifty-empty-state-title">No hay dietas</h2>
                <p className="lifty-empty-state-text">
                  {searchTerm
                    ? "No se encontraron dietas con ese nombre"
                    : "Aún no tienes dietas creadas. ¡Crea tu primera dieta!"}
                </p>
              </div>
            ) : (
              // Diets List
              <div className="lifty-content-grid">
                {filteredDiets.map((diet) => (
                  <DietCard
                    key={diet.id_diet}
                    diet={diet}
                    onActivate={handleActivateDiet}
                    onDelete={handleDeleteDiet}
                  />
                ))}
              </div>
            )}
          </main>

          {/* ========== FAB (Floating Action Button) ========== */}
          <button
            className="lifty-fab-action"
            onClick={handleCreateDiet}
            aria-label="Crear Dieta"
          >
            <Plus className="lifty-fab-action-icon" size={24} strokeWidth={2} />
            <span className="lifty-fab-action-label">Crear Dieta</span>
          </button>
        </div>
      ) : activeTab === "meta-diaria" ? (
        // META DIARIA TAB
        <div className="lifty-page">
          <main className="lifty-content">
            {/* Botón de Calendario */}
            <div className="calendar-button-container">
              <button
                className="meals-main-action-btn"
                onClick={() => navigate("/meals-calendar")}
              >
                <Calendar size={20} strokeWidth={2} />
                <span>Ver Calendario</span>
              </button>
            </div>

            {loadingGoals ? (
              <div className="lifty-empty-state">
                <p>Cargando...</p>
              </div>
            ) : !dailyGoals ? (
              <div className="lifty-empty-state">
                <Target
                  className="lifty-empty-state-icon"
                  size={64}
                  strokeWidth={1.5}
                />
                <h2 className="lifty-empty-state-title">Error</h2>
                <p className="lifty-empty-state-text">
                  No se pudieron cargar tus metas diarias
                </p>
              </div>
            ) : (
              <div className="daily-goals-container">
                {/* Calorías - Fila completa */}
                <div className="calories-card-wrapper">
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info-top">
                        <div className="goal-icon-wrapper calories">
                          <Flame size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="goal-title">Calorías</h3>
                      </div>
                      <div className="goal-value">
                        <span className="current-value">
                          {Math.floor(consumedTotals.calories)}
                        </span>
                        <span className="separator">/</span>
                        <span className="target-value">
                          {dailyGoals.calories_goal}
                        </span>
                        <span className="unit">kcal</span>
                      </div>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern calories"
                        style={{
                          width: `${Math.min(
                            (consumedTotals.calories /
                              dailyGoals.calories_goal) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="progress-label">
                          {Math.floor(
                            (consumedTotals.calories /
                              dailyGoals.calories_goal) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Macros - Grid 2x2 */}
                <div className="macros-grid">
                  {/* Proteínas */}
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info-top">
                        <div className="goal-icon-wrapper protein">
                          <UtensilsCrossed size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="goal-title">Proteínas</h3>
                      </div>
                      <div className="goal-value">
                        <span className="current-value">
                          {Math.floor(consumedTotals.protein)}
                        </span>
                        <span className="separator">/</span>
                        <span className="target-value">
                          {dailyGoals.protein_goal}
                        </span>
                        <span className="unit">g</span>
                      </div>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern protein"
                        style={{
                          width: `${Math.min(
                            (consumedTotals.protein / dailyGoals.protein_goal) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="progress-label">
                          {Math.floor(
                            (consumedTotals.protein / dailyGoals.protein_goal) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Carbohidratos */}
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info-top">
                        <div className="goal-icon-wrapper carbs">
                          <Apple size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="goal-title">Carbos</h3>
                      </div>
                      <div className="goal-value">
                        <span className="current-value">
                          {Math.floor(consumedTotals.carbs)}
                        </span>
                        <span className="separator">/</span>
                        <span className="target-value">
                          {dailyGoals.carbs_goal}
                        </span>
                        <span className="unit">g</span>
                      </div>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern carbs"
                        style={{
                          width: `${Math.min(
                            (consumedTotals.carbs / dailyGoals.carbs_goal) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="progress-label">
                          {Math.floor(
                            (consumedTotals.carbs / dailyGoals.carbs_goal) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Grasas */}
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info-top">
                        <div className="goal-icon-wrapper fats">
                          <Pizza size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="goal-title">Grasas</h3>
                      </div>
                      <div className="goal-value">
                        <span className="current-value">
                          {Math.floor(consumedTotals.fats)}
                        </span>
                        <span className="separator">/</span>
                        <span className="target-value">
                          {dailyGoals.fats_goal}
                        </span>
                        <span className="unit">g</span>
                      </div>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern fats"
                        style={{
                          width: `${Math.min(
                            (consumedTotals.fats / dailyGoals.fats_goal) * 100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="progress-label">
                          {Math.floor(
                            (consumedTotals.fats / dailyGoals.fats_goal) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Agua */}
                  <div className="goal-card">
                    <div className="goal-header">
                      <div className="goal-info-top">
                        <div className="goal-icon-wrapper water">
                          <Droplet size={20} strokeWidth={2.5} />
                        </div>
                        <h3 className="goal-title">Agua</h3>
                      </div>
                      <div className="goal-value">
                        <span className="current-value">
                          {Number(dailyGoals?.water_consumed || 0).toFixed(1)}
                        </span>
                        <span className="separator">/</span>
                        <span className="target-value">
                          {dailyGoals?.water_goal || 0}
                        </span>
                        <span className="unit">L</span>
                      </div>
                    </div>
                    <div className="progress-bar-modern">
                      <div
                        className="progress-fill-modern water"
                        style={{
                          width: `${Math.min(
                            ((dailyGoals?.water_consumed || 0) /
                              (dailyGoals?.water_goal || 1)) *
                              100,
                            100
                          )}%`,
                        }}
                      >
                        <span className="progress-label">
                          {Math.floor(
                            ((dailyGoals?.water_consumed || 0) /
                              (dailyGoals?.water_goal || 1)) *
                              100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                    {dailyGoals && dailyGoals.water_consumed > 0 && (
                      <button
                        className="lifty-btn-primary"
                        className="lifty-btn-secondary-dark"
                        onClick={handleResetWater}
                        title="Resetear agua consumida"
                      >
                        <RotateCcw size={14} />
                        <span>Resetear</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Botones de Agua */}
                <h3 className="water-section-title">Agua Consumida Hoy</h3>
                <div className="water-buttons-container">
                  <button
                    type="button"
                    className="water-button"
                    onClick={() => handleAddWater(0.2)}
                    title="200ml"
                  >
                    <GlassWater size={20} strokeWidth={2} />
                    <span>200ml</span>
                  </button>
                  <button
                    type="button"
                    className="water-button"
                    onClick={() => handleAddWater(0.4)}
                    title="400ml"
                  >
                    <GlassWater size={24} strokeWidth={2} />
                    <span>400ml</span>
                  </button>
                  <button
                    type="button"
                    className="water-button"
                    onClick={() => handleAddWater(0.5)}
                    title="500ml"
                  >
                    <Coffee size={22} strokeWidth={2} />
                    <span>500ml</span>
                  </button>
                  <button
                    type="button"
                    className="water-button"
                    onClick={() => handleAddWater(1)}
                    title="1 Litro"
                  >
                    <Milk size={24} strokeWidth={2} />
                    <span>1L</span>
                  </button>
                </div>

                {/* Comidas Consumidas */}
                <div className="consumed-meals-section">
                  <div className="consumed-header">
                    <h3 className="consumed-title">Comidas Consumidas Hoy</h3>
                    <button
                      className="meals-main-action-btn"
                      onClick={() => setShowMealSelector(true)}
                    >
                      <Plus size={18} strokeWidth={2.5} />
                      <span>Agregar Comida</span>
                    </button>
                  </div>

                  {loadingConsumed ? (
                    <div className="loading-state">Cargando...</div>
                  ) : consumedMeals.length === 0 ? (
                    <div className="consumed-empty">
                      <p>No has registrado comidas hoy</p>
                    </div>
                  ) : (
                    <div className="consumed-meals-list">
                      {consumedMeals.map((consumed) => {
                        // Obtener el icono de la comida consumida
                        const consumedIcon = availableIcons.find(
                          (icon) => icon.name === consumed.icon
                        );
                        const ConsumedIconComponent = consumedIcon
                          ? consumedIcon.component
                          : UtensilsCrossed;

                        return (
                          <div
                            key={consumed.id_consumed}
                            className="consumed-meal-card"
                          >
                            <div className="consumed-meal-icon">
                              <ConsumedIconComponent size={32} />
                            </div>
                            <div className="consumed-meal-info">
                              <h4 className="consumed-meal-name">
                                {consumed.name}
                              </h4>
                              <div className="consumed-meal-macros">
                                <span className="consumed-macro">
                                  <Flame size={14} /> {consumed.calories} kcal
                                </span>
                                <span className="consumed-macro">
                                  P: {consumed.protein}g
                                </span>
                                <span className="consumed-macro">
                                  C: {consumed.carbs}g
                                </span>
                                <span className="consumed-macro">
                                  F: {consumed.fats}g
                                </span>
                              </div>
                            </div>
                            <button
                              className="lifty-btn-primary"
                              className="lifty-btn-secondary-dark"
                              onClick={() =>
                                handleRemoveConsumedMeal(consumed.id_consumed)
                              }
                              title="Eliminar"
                            >
                              <X size={18} strokeWidth={2.5} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Selector de Comidas */}
            {showMealSelector && (
              <div
                className="meal-selector-modal"
                onClick={() => setShowMealSelector(false)}
              >
                <div
                  className="meal-selector-container"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="meal-selector-header">
                    <h2>Seleccionar Comida</h2>
                    <button
                      className="close-selector"
                      onClick={() => setShowMealSelector(false)}
                    >
                      <X size={24} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Barra de búsqueda en el modal */}
                  <div className="meal-selector-search">
                    <Search
                      className="selector-search-icon"
                      size={18}
                      strokeWidth={2}
                    />
                    <input
                      type="search"
                      className="selector-search-input"
                      placeholder="Buscar comida..."
                      value={selectorSearch}
                      onChange={(e) => setSelectorSearch(e.target.value)}
                    />
                  </div>

                  <div className="meal-selector-list">
                    {meals.length === 0 ? (
                      <div className="selector-empty">
                        <p>No tienes comidas guardadas</p>
                        <p className="selector-empty-hint">
                          Ve a la sección Comidas para crear algunas
                        </p>
                      </div>
                    ) : (
                      (() => {
                        // Filtrar comidas por búsqueda
                        const filteredMeals = meals.filter((meal) =>
                          meal.name
                            .toLowerCase()
                            .includes(selectorSearch.toLowerCase())
                        );

                        return filteredMeals.length === 0 ? (
                          <div className="selector-empty">
                            <Search
                              size={48}
                              strokeWidth={1.5}
                              style={{ opacity: 0.3, marginBottom: "0.5rem" }}
                            />
                            <p>No se encontraron comidas</p>
                            <p className="selector-empty-hint">
                              Intenta con otro término de búsqueda
                            </p>
                          </div>
                        ) : (
                          filteredMeals.map((meal) => {
                            // Obtener el icono para el selector
                            const selectorIcon = availableIcons.find(
                              (icon) => icon.name === meal.icon
                            );
                            const SelectorIconComponent = selectorIcon
                              ? selectorIcon.component
                              : UtensilsCrossed;

                            return (
                              <div
                                key={meal.id_meal}
                                className="meal-selector-item"
                                onClick={() =>
                                  handleAddConsumedMeal(meal.id_meal)
                                }
                              >
                                <div className="meal-selector-icon">
                                  <SelectorIconComponent size={28} />
                                </div>
                                <div className="meal-selector-info">
                                  <h4 className="meal-selector-name">
                                    {meal.name}
                                  </h4>
                                  <div className="meal-selector-macros">
                                    <span>
                                      <Flame size={14} /> {meal.calories} kcal
                                    </span>
                                    <span>P: {meal.protein}g</span>
                                    <span>C: {meal.carbs}g</span>
                                    <span>F: {meal.fats}g</span>
                                  </div>
                                </div>
                                <div className="meal-selector-action">
                                  <Plus size={20} strokeWidth={2.5} />
                                </div>
                              </div>
                            );
                          })
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      ) : (
        // COMIDAS TAB
        <div className="lifty-page">
          <main className="lifty-content meals-section">
            {/* Barra de búsqueda */}
            <div className="meals-search-container">
              <Search className="meals-search-icon" size={20} strokeWidth={2} />
              <input
                type="search"
                className="meals-search-input"
                placeholder="Buscar comida..."
                value={searchMeal}
                onChange={(e) => setSearchMeal(e.target.value)}
              />
            </div>

            {/* Botón para agregar comida */}
            <div className="add-meal-button-container">
              <button
                className="lifty-btn-secondary-dark meals-main-action-btn"
                style={{
                  background: "#252529",
                  color: "#fff",
                  border: "1.5px solid rgba(120,130,182,0.15)",
                  width: "100%",
                  justifyContent: "center",
                  fontSize: "1rem",
                  padding: "1rem 1.5rem",
                  borderRadius: "12px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
                onClick={() => setShowMealForm(true)}
              >
                <Plus size={20} strokeWidth={2.5} />
                <span>Agregar Comida</span>
              </button>
            </div>

            {/* Modal del formulario */}
            {showMealForm && (
              <div className="meal-form-modal">
                <div
                  className="meal-form-overlay"
                  onClick={handleCancelForm}
                ></div>
                <div className="meal-form-container">
                  <div className="meal-form-header">
                    <h2>{editingMeal ? "Editar Comida" : "Nueva Comida"}</h2>
                    <button className="close-button" onClick={handleCancelForm}>
                      <X size={24} />
                    </button>
                  </div>

                  <form onSubmit={handleSubmitMeal} className="meal-form">
                    <div className="form-group">
                      <label>Nombre de la Comida *</label>
                      <input
                        type="text"
                        name="name"
                        value={mealFormData.name}
                        onChange={handleMealFormChange}
                        placeholder="Ej: Pechuga de pollo con arroz"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Calorías (kcal) *</label>
                        <input
                          type="number"
                          name="calories"
                          value={mealFormData.calories}
                          onChange={handleMealFormChange}
                          placeholder="450"
                          min="0"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Proteínas (g) *</label>
                        <input
                          type="number"
                          step="0.1"
                          name="protein"
                          value={mealFormData.protein}
                          onChange={handleMealFormChange}
                          placeholder="35.5"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Carbohidratos (g) *</label>
                        <input
                          type="number"
                          step="0.1"
                          name="carbs"
                          value={mealFormData.carbs}
                          onChange={handleMealFormChange}
                          placeholder="52.0"
                          min="0"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Grasas (g) *</label>
                        <input
                          type="number"
                          step="0.1"
                          name="fats"
                          value={mealFormData.fats}
                          onChange={handleMealFormChange}
                          placeholder="8.5"
                          min="0"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Icono de Comida *</label>
                      <div className="icon-selector">
                        {availableIcons.map((iconOption) => {
                          const IconComponent = iconOption.component;
                          return (
                            <div
                              key={iconOption.name}
                              className={`icon-option ${
                                mealFormData.icon === iconOption.name
                                  ? "selected"
                                  : ""
                              }`}
                              onClick={() =>
                                setMealFormData({
                                  ...mealFormData,
                                  icon: iconOption.name,
                                })
                              }
                              title={iconOption.label}
                            >
                              <IconComponent size={24} />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="btn-cancel"
                        onClick={handleCancelForm}
                      >
                        Cancelar
                      </button>
                      <button type="submit" className="btn-submit">
                        {editingMeal ? "Actualizar" : "Guardar"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Lista de comidas */}
            {loadingMeals ? (
              <div className="loading-state">Cargando comidas...</div>
            ) : (
              (() => {
                // Filtrar comidas por búsqueda
                const filteredMeals = meals.filter((meal) =>
                  meal.name.toLowerCase().includes(searchMeal.toLowerCase())
                );

                return filteredMeals.length === 0 ? (
                  <div className="lifty-empty-state">
                    {searchMeal ? (
                      <>
                        <Search
                          className="lifty-empty-state-icon"
                          size={64}
                          strokeWidth={1.5}
                        />
                        <h2 className="lifty-empty-state-title">
                          No se encontraron comidas
                        </h2>
                        <p className="lifty-empty-state-text">
                          Intenta con otro término de búsqueda
                        </p>
                      </>
                    ) : (
                      <>
                        <Pizza
                          className="lifty-empty-state-icon"
                          size={64}
                          strokeWidth={1.5}
                        />
                        <h2 className="lifty-empty-state-title">
                          No hay comidas
                        </h2>
                        <p className="lifty-empty-state-text">
                          Agrega tu primera comida para empezar a trackear
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="meals-grid">
                    {filteredMeals.map((meal) => {
                      // Obtener el componente del icono
                      const mealIcon = availableIcons.find(
                        (icon) => icon.name === meal.icon
                      );
                      const MealIconComponent = mealIcon
                        ? mealIcon.component
                        : UtensilsCrossed;

                      return (
                        <div key={meal.id_meal} className="meal-card">
                          <div className="meal-icon-display">
                            <MealIconComponent size={48} />
                          </div>
                          <div className="meal-content">
                            <h3 className="meal-name">{meal.name}</h3>
                            <div className="meal-macros">
                              <div className="macro-item">
                                <Flame size={16} />
                                <span>{meal.calories} kcal</span>
                              </div>
                              <div className="macro-item">
                                <span className="macro-label">P:</span>
                                <span>{meal.protein}g</span>
                              </div>
                              <div className="macro-item">
                                <span className="macro-label">C:</span>
                                <span>{meal.carbs}g</span>
                              </div>
                              <div className="macro-item">
                                <span className="macro-label">F:</span>
                                <span>{meal.fats}g</span>
                              </div>
                            </div>
                            <div className="meal-actions">
                              <button
                                className="btn-edit"
                                onClick={() => handleEditMeal(meal)}
                              >
                                <Edit2 size={16} />
                                <span>Editar</span>
                              </button>
                              <button
                                className="btn-edit"
                                onClick={() => handleDeleteMeal(meal.id_meal)}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </main>
        </div>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Meals;
