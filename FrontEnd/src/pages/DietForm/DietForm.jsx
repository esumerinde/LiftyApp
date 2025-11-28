import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Plus, Trash2, UtensilsCrossed, X, Apple, Pizza, Coffee, Milk, Beef, Fish, Egg, Drumstick, Salad, Sandwich, IceCream, Cookie, Banana, Soup, CakeSlice, Croissant, Flame } from "lucide-react";
import Toast from "../../components/Toast/Toast";
import { createDiet, updateDiet, getDietById, addMealToDiet, removeMealFromDiet } from "../../services/dietsService";
import { getUserMeals } from "../../services/mealsService";
import "./DietForm.css";

const DietForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    goal: "Mantenimiento",
    calories_per_day: 2000,
    protein_goal: 150,
    carbs_goal: 200,
    fats_goal: 60,
    water_goal: 2.5,
  });

  const [selectedMeals, setSelectedMeals] = useState([]);
  const [availableMeals, setAvailableMeals] = useState([]);
  const [showMealSelector, setShowMealSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDiet, setLoadingDiet] = useState(false);
  const [toast, setToast] = useState(null);

  // Iconos disponibles
  const availableIcons = [
    { name: "UtensilsCrossed", component: UtensilsCrossed },
    { name: "Apple", component: Apple },
    { name: "Pizza", component: Pizza },
    { name: "Coffee", component: Coffee },
    { name: "Milk", component: Milk },
    { name: "Beef", component: Beef },
    { name: "Fish", component: Fish },
    { name: "Egg", component: Egg },
    { name: "Drumstick", component: Drumstick },
    { name: "Salad", component: Salad },
    { name: "Sandwich", component: Sandwich },
    { name: "IceCream", component: IceCream },
    { name: "Cookie", component: Cookie },
    { name: "Banana", component: Banana },
    { name: "Soup", component: Soup },
    { name: "CakeSlice", component: CakeSlice },
    { name: "Croissant", component: Croissant },
  ];

  useEffect(() => {
    loadAvailableMeals();
    if (isEditMode) {
      loadDiet();
    }
  }, [id]);

  const loadAvailableMeals = async () => {
    const result = await getUserMeals();
    if (result.success) {
      setAvailableMeals(result.data);
    }
  };

  const loadDiet = async () => {
    setLoadingDiet(true);
    const result = await getDietById(id);
    if (result.success) {
      const diet = result.data;
      setFormData({
        name: diet.name,
        description: diet.description || "",
        goal: diet.goal || "Mantenimiento",
        calories_per_day: diet.calories_per_day,
        protein_goal: diet.protein_goal,
        carbs_goal: diet.carbs_goal,
        fats_goal: diet.fats_goal,
        water_goal: diet.water_goal,
      });
      setSelectedMeals(diet.meals || []);
    }
    setLoadingDiet(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAddMeal = async (meal) => {
    if (isEditMode) {
      const result = await addMealToDiet(id, meal.id_meal, selectedMeals.length);
      if (result.success) {
        setSelectedMeals([...selectedMeals, meal]);
        setShowMealSelector(false);
      } else {
        setToast({ message: result.message, type: "error" });
      }
    } else {
      setSelectedMeals([...selectedMeals, meal]);
      setShowMealSelector(false);
    }
  };

  const handleRemoveMeal = async (mealId, index) => {
    if (isEditMode) {
      const result = await removeMealFromDiet(id, mealId);
      if (result.success) {
        setSelectedMeals(selectedMeals.filter((m, i) => i !== index));
      } else {
        setToast({ message: result.message, type: "error" });
      }
    } else {
      setSelectedMeals(selectedMeals.filter((m, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const dietData = {
      ...formData,
      calories_per_day: parseInt(formData.calories_per_day),
      protein_goal: parseInt(formData.protein_goal),
      carbs_goal: parseInt(formData.carbs_goal),
      fats_goal: parseInt(formData.fats_goal),
      water_goal: parseFloat(formData.water_goal),
    };

    let result;
    if (isEditMode) {
      result = await updateDiet(id, dietData);
    } else {
      result = await createDiet(dietData);
      
      // Si se creó exitosamente y hay comidas seleccionadas, agregarlas
      if (result.success && selectedMeals.length > 0) {
        const dietId = result.data.id_diet;
        let mealsAdded = 0;
        for (let i = 0; i < selectedMeals.length; i++) {
          const mealResult = await addMealToDiet(dietId, selectedMeals[i].id_meal, i);
          if (mealResult.success) {
            mealsAdded++;
          } else {
            console.error(`Error al agregar comida ${i}:`, mealResult.message);
          }
        }
        console.log(`${mealsAdded} de ${selectedMeals.length} comidas agregadas`);
      }
    }

    setLoading(false);

    if (result.success) {
      setToast({ 
        message: isEditMode ? "Dieta actualizada exitosamente" : "Dieta creada exitosamente", 
        type: "success" 
      });
      setTimeout(() => {
        navigate("/meals?tab=dietas");
      }, 1500);
    } else {
      setToast({ message: result.message || "Error al guardar la dieta", type: "error" });
    }
  };

  const goalOptions = [
    "Pérdida de peso",
    "Ganancia muscular",
    "Mantenimiento",
    "Definición",
    "Rendimiento",
  ];

  if (loadingDiet) {
    return (
      <div className="diet-form-container">
        <div className="diet-form-content">
          <p>Cargando dieta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diet-form-container">
      <div className="diet-form-content">
        <div className="diet-form-header">
          <h1 className="diet-form-title">
            {isEditMode ? "Editar Dieta" : "Nueva Dieta"}
          </h1>
          <p className="diet-form-subtitle">
            {isEditMode
              ? "Modifica los detalles de tu dieta"
              : "Crea una dieta personalizada con tus objetivos nutricionales"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="diet-form">
          {/* Información básica */}
          <div className="form-section">
            <h2 className="section-title">Información Básica</h2>
            
            <div className="form-group">
              <label className="form-label">Nombre de la Dieta *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="Ej: Dieta Hipocalórica"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                name="description"
                className="form-textarea"
                placeholder="Describe tu dieta..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Objetivo</label>
              <select
                name="goal"
                className="form-select"
                value={formData.goal}
                onChange={handleChange}
              >
                {goalOptions.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Macros y metas */}
          <div className="form-section">
            <h2 className="section-title">Metas Nutricionales</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Calorías/día (kcal)</label>
                <input
                  type="number"
                  name="calories_per_day"
                  className="form-input"
                  value={formData.calories_per_day}
                  onChange={handleChange}
                  min="1000"
                  max="5000"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Proteínas (g)</label>
                <input
                  type="number"
                  name="protein_goal"
                  className="form-input"
                  value={formData.protein_goal}
                  onChange={handleChange}
                  min="0"
                  max="500"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Carbohidratos (g)</label>
                <input
                  type="number"
                  name="carbs_goal"
                  className="form-input"
                  value={formData.carbs_goal}
                  onChange={handleChange}
                  min="0"
                  max="500"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Grasas (g)</label>
                <input
                  type="number"
                  name="fats_goal"
                  className="form-input"
                  value={formData.fats_goal}
                  onChange={handleChange}
                  min="0"
                  max="200"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Agua (litros)</label>
              <input
                type="number"
                name="water_goal"
                className="form-input"
                value={formData.water_goal}
                onChange={handleChange}
                step="0.1"
                min="0"
                max="10"
                required
              />
            </div>
          </div>

          {/* Comidas */}
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">Comidas ({selectedMeals.length})</h2>
              <button
                type="button"
                className="btn-add-meal"
                onClick={() => setShowMealSelector(true)}
              >
                <Plus size={18} />
                Agregar Comida
              </button>
            </div>

            {selectedMeals.length === 0 ? (
              <div className="empty-meals">
                <UtensilsCrossed size={48} strokeWidth={1.5} />
                <p>No hay comidas en esta dieta</p>
              </div>
            ) : (
              <div className="meals-list">
                {selectedMeals.map((meal, index) => {
                  // Obtener el icono de la comida
                  const mealIcon = availableIcons.find(icon => icon.name === meal.icon);
                  const MealIconComponent = mealIcon ? mealIcon.component : UtensilsCrossed;
                  
                  return (
                  <div key={`${meal.id_meal}-${index}`} className="meal-item">
                    <div className="meal-icon">
                      <MealIconComponent size={32} />
                    </div>
                    <div className="meal-info">
                      <h4 className="meal-name">{meal.name}</h4>
                      <div className="meal-macros">
                        <span className="meal-macro">
                          <Flame size={14} /> {meal.calories} kcal
                        </span>
                        <span className="meal-macro">P: {meal.protein}g</span>
                        <span className="meal-macro">C: {meal.carbs}g</span>
                        <span className="meal-macro">F: {meal.fats}g</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-meal"
                      onClick={() => handleRemoveMeal(meal.id_meal, index)}
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

          {/* Botones de acción */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate("/meals?tab=dietas")}
            >
              Cancelar
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              <Save size={18} />
              {loading ? "Guardando..." : isEditMode ? "Actualizar" : "Crear Dieta"}
            </button>
          </div>
        </form>
      </div>

      {/* Selector de comidas */}
      {showMealSelector && (
        <div className="modal-overlay" onClick={() => setShowMealSelector(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seleccionar Comida</h3>
              <button onClick={() => setShowMealSelector(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              {availableMeals.length === 0 ? (
                <p>No hay comidas disponibles. Crea comidas primero.</p>
              ) : (
                <div className="meals-selector-list">
                  {availableMeals.map((meal) => {
                    // Obtener el icono de la comida
                    const mealIcon = availableIcons.find(icon => icon.name === meal.icon);
                    const MealIconComponent = mealIcon ? mealIcon.component : UtensilsCrossed;
                    
                    return (
                      <div
                        key={meal.id_meal}
                        className="meal-selector-item"
                        onClick={() => handleAddMeal(meal)}
                      >
                        <div className="meal-selector-icon">
                          <MealIconComponent size={28} />
                        </div>
                        <div className="meal-selector-info">
                          <p className="meal-selector-name">{meal.name}</p>
                          <div className="meal-selector-macros">
                            <span className="selector-macro">
                              <Flame size={14} /> {meal.calories} kcal
                            </span>
                            <span className="selector-macro">P: {meal.protein}g</span>
                            <span className="selector-macro">C: {meal.carbs}g</span>
                            <span className="selector-macro">F: {meal.fats}g</span>
                          </div>
                        </div>
                        <div className="meal-selector-action">
                          <Plus size={20} strokeWidth={2.5} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
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

export default DietForm;
