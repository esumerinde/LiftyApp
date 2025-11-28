import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, UtensilsCrossed } from "lucide-react";
import DietCard from "../../components/DietCard/DietCard";
import "./Diets.css";

// Mock Data
const dummyDiets = [
  {
    id_diet: 1,
    name: "Hypocaloric Diet",
    description:
      "Controlled caloric deficit meal plan. Ideal for fat loss while maintaining muscle mass.",
    goal: "Weight Loss",
    calories_per_day: 1800,
    meals_count: 5,
  },
  {
    id_diet: 2,
    name: "Clean Bulk",
    description:
      "High-quality calorie diet for muscle mass gain. High protein and complex carbohydrates.",
    goal: "Muscle Gain",
    calories_per_day: 3200,
    meals_count: 6,
  },
  {
    id_diet: 3,
    name: "Maintenance",
    description:
      "Balanced plan to maintain current weight. Balanced macronutrient distribution.",
    goal: "Maintenance",
    calories_per_day: 2400,
    meals_count: 4,
  },
  {
    id_diet: 4,
    name: "Keto Fitness",
    description:
      "Ketogenic diet adapted for training. Low carbs, high healthy fats.",
    goal: "Definition",
    calories_per_day: 2000,
    meals_count: 4,
  },
  {
    id_diet: 5,
    name: "High Protein",
    description:
      "High protein intake for muscle recovery and growth. Ideal for intense training.",
    goal: "Muscle Gain",
    calories_per_day: 2800,
    meals_count: 5,
  },
];

const Diets = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { id: "all", label: "All" },
    { id: "my-diets", label: "My Diets" },
    { id: "favorites", label: "Favorites" },
  ];

  // Filter diets by search
  const filteredDiets = dummyDiets.filter((diet) =>
    diet.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDiet = () => {
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate("/diets/new");
  };

  return (
    <div className="lifty-page">
      {/* ========== HEADER STICKY ========== */}
      <header className="lifty-header">
        <h1 className="lifty-page-title">My Diets</h1>

        {/* Search Bar */}
        <div className="lifty-search-container">
          <Search className="lifty-search-icon" size={20} strokeWidth={2} />
          <input
            type="search"
            className="lifty-search-input"
            placeholder="Search diets..."
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
        {filteredDiets.length === 0 ? (
          // Empty State
          <div className="lifty-empty-state">
            <UtensilsCrossed
              className="lifty-empty-state-icon"
              size={64}
              strokeWidth={1.5}
            />
            <h2 className="lifty-empty-state-title">No diets found</h2>
            <p className="lifty-empty-state-text">
              {searchTerm
                ? "No diets found with that name"
                : "You don't have any diets yet. Create your first diet!"}
            </p>
          </div>
        ) : (
          // Diets List
          <div className="lifty-content-grid">
            {filteredDiets.map((diet) => (
              <DietCard key={diet.id_diet} diet={diet} />
            ))}
          </div>
        )}
      </main>

      {/* ========== FAB (Floating Action Button) ========== */}
      <button
        className="fab-button"
        onClick={handleCreateDiet}
        aria-label="Create new diet"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default Diets;
