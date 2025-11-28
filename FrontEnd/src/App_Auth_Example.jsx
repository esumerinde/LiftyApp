import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas principales (con MainLayout) */}
        <Route path="/" element={<Home />} />
        <Route
          path="/routines"
          element={<div>Mis Rutinas - Próximamente</div>}
        />
        <Route
          path="/exercises"
          element={<div>Ejercicios - Próximamente</div>}
        />
        <Route path="/diets" element={<div>Mis Dietas - Próximamente</div>} />
        <Route path="/meals" element={<div>Comidas - Próximamente</div>} />
        <Route path="/profile" element={<div>Mi Perfil - Próximamente</div>} />

        {/* Ruta 404 */}
        <Route path="*" element={<div>404 - Página no encontrada</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
