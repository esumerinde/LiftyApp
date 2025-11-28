import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Flame, UtensilsCrossed, Apple, Pizza, Droplet, Edit, Check, Trash2, X, Coffee, Milk, Beef, Fish, Egg, Drumstick, Salad, Sandwich, IceCream, Cookie, Banana, Soup, CakeSlice, Croissant } from "lucide-react";
import Toast from "../../components/Toast/Toast";
import ConfirmDialog from "../../components/ConfirmDialog/ConfirmDialog";
import { getDietById, activateDiet, deleteDiet, removeMealFromDiet } from "../../services/dietsService";
import "./DietDetail.css";

const DietDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [diet, setDiet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

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
    loadDiet();
  }, [id]);

  const loadDiet = async () => {
    setLoading(true);
    const result = await getDietById(id);
    if (result.success) {
      setDiet(result.data);
    }
    setLoading(false);
  };

  const handleActivate = async () => {
    // Si ya está activada, no hacer nada
    if (diet.is_currently_active) {
      return;
    }

    const result = await activateDiet(id);
    if (result.success) {
      setToast({ message: result.message || "Dieta activada exitosamente", type: "success" });
      // Recargar la dieta para actualizar el estado
      loadDiet();
    } else {
      setToast({ message: result.message || "Error al activar la dieta", type: "error" });
    }
  };

  const handleEdit = () => {
    navigate(`/diets/${id}/edit`);
  };

  const handleDelete = () => {
    setConfirmDialog({
      title: "Eliminar Dieta",
      message: `¿Estás seguro de que deseas eliminar la dieta "${diet.name}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        const result = await deleteDiet(id);
        setConfirmDialog(null);
        if (result.success) {
          setToast({ message: "Dieta eliminada exitosamente", type: "success" });
          setTimeout(() => {
            navigate("/meals?tab=dietas");
          }, 1500);
        } else {
          setToast({ message: result.message || "Error al eliminar la dieta", type: "error" });
        }
      },
      onCancel: () => setConfirmDialog(null),
    });
  };

  const handleRemoveMeal = async (mealId) => {
    const result = await removeMealFromDiet(id, mealId);
    if (result.success) {
      loadDiet();
      setToast({ message: "Comida eliminada de la dieta", type: "success" });
    } else {
      setToast({ message: result.message || "Error al eliminar la comida", type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="diet-detail-container">
        <div className="diet-detail-content">
          <p>Cargando dieta...</p>
        </div>
      </div>
    );
  }

  if (!diet) {
    return (
      <div className="diet-detail-container">
        <div className="diet-detail-content">
          <p>Dieta no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="diet-detail-container">
      <div className="diet-detail-content">
        {/* Header */}
        <div className="diet-detail-header">
          <div>
            <h1 className="diet-detail-title">{diet.name}</h1>
            {diet.goal && <span className="diet-goal-badge">{diet.goal}</span>}
          </div>
          {diet.description && (
            <p className="diet-description">{diet.description}</p>
          )}
        </div>

        {/* Macros */}
        <div className="diet-macros-section">
          <h2 className="section-title">Metas Nutricionales</h2>
          <div className="macros-grid">
            <div className="macro-card">
              <div className="macro-icon calories">
                <Flame size={20} />
              </div>
              <div className="macro-info">
                <p className="macro-label">Calorías</p>
                <p className="macro-value">{diet.calories_per_day} kcal</p>
              </div>
            </div>

            <div className="macro-card">
              <div className="macro-icon protein">
                <UtensilsCrossed size={20} strokeWidth={2.5} />
              </div>
              <div className="macro-info">
                <p className="macro-label">Proteínas</p>
                <p className="macro-value">{diet.protein_goal}g</p>
              </div>
            </div>

            <div className="macro-card">
              <div className="macro-icon carbs">
                <Apple size={20} strokeWidth={2.5} />
              </div>
              <div className="macro-info">
                <p className="macro-label">Carbos</p>
                <p className="macro-value">{diet.carbs_goal}g</p>
              </div>
            </div>

            <div className="macro-card">
              <div className="macro-icon fats">
                <Pizza size={20} strokeWidth={2.5} />
              </div>
              <div className="macro-info">
                <p className="macro-label">Grasas</p>
                <p className="macro-value">{diet.fats_goal}g</p>
              </div>
            </div>

            <div className="macro-card">
              <div className="macro-icon water">
                <Droplet size={20} strokeWidth={2.5} />
              </div>
              <div className="macro-info">
                <p className="macro-label">Agua</p>
                <p className="macro-value">{diet.water_goal}L</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="diet-meals-section">
          <h2 className="section-title">
            Comidas ({diet.meals?.length || 0})
          </h2>
          {!diet.meals || diet.meals.length === 0 ? (
            <div className="empty-meals">
              <UtensilsCrossed size={48} strokeWidth={1.5} />
              <p>No hay comidas en esta dieta</p>
            </div>
          ) : (
            <div className="meals-list">
              {diet.meals.map((meal, index) => {
                // Obtener el icono de la comida
                const mealIcon = availableIcons.find(icon => icon.name === meal.icon);
                const MealIconComponent = mealIcon ? mealIcon.component : UtensilsCrossed;
                
                return (
                <div key={`${meal.id_meal}-${index}`} className="meal-card">
                  <div className="meal-icon">
                    <MealIconComponent size={32} />
                  </div>
                  <div className="meal-info">
                    <h3 className="meal-name">{meal.name}</h3>
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
                    className="btn-remove-meal"
                    onClick={() => handleRemoveMeal(meal.id_meal)}
                    aria-label="Eliminar comida"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="diet-actions">
          <button 
            className={diet.is_currently_active ? "btn-activate-active" : "btn-activate"}
            onClick={handleActivate}
            disabled={diet.is_currently_active}
          >
            <Check size={18} />
            {diet.is_currently_active ? "Activada" : "Activar Dieta"}
          </button>
          <button className="btn-edit" onClick={handleEdit}>
            <Edit size={18} />
            Editar
          </button>
          <button className="btn-delete" onClick={handleDelete}>
            <Trash2 size={18} />
            Eliminar
          </button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {confirmDialog && (
        <ConfirmDialog
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.onConfirm}
          onCancel={confirmDialog.onCancel}
        />
      )}
    </div>
  );
};

export default DietDetail;
