import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Agrega más rutas aquí cuando las crees */}
        {/* <Route path="/routines" element={<Routines />} /> */}
        {/* <Route path="/workout" element={<Workout />} /> */}
        {/* <Route path="/meals" element={<Meals />} /> */}
        {/* <Route path="/profile" element={<Profile />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
