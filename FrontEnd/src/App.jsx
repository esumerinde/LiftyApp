import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { ActiveWorkoutProvider } from "./context/ActiveWorkoutContext";
import MainLayout from "./layout/MainLayout/MainLayout";
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Routines from "./pages/Routines/Routines";
import QrWizardPage from "./pages/QrWizard/QrWizardPage";
import RoutineForm from "./pages/RoutineForm/RoutineForm";
import Meals from "./pages/Meals/Meals";
import DietForm from "./pages/DietForm/DietForm";
import DietDetail from "./pages/DietDetail/DietDetail";
import Explore from "./pages/Explore/Explore";
import MyAccount from "./pages/MyAccount/MyAccount";
import MyData from "./pages/MyData/MyData";
import WorkoutHub from "./pages/WorkoutHub/WorkoutHub";
import WorkoutPage from "./pages/WorkoutPage/WorkoutPage";
import WorkoutPageEnding from "./pages/WorkoutPage/WorkoutPageEnding";
import WorkoutCompleted from "./pages/WorkoutCompleted/WorkoutCompleted";
import RoutineBuilder from "./pages/RoutineBuilder/RoutineBuilder";
import MealHub from "./pages/MealHub/MealHub";
import AllExercises from "./pages/AllExercises/AllExercises";
import Messages from "./pages/Messages/Messages";
import Chat from "./pages/Chat/Chat";
import UserProfile from "./pages/UserProfile/UserProfile";
import RoutineDetail from "./pages/RoutineDetail/RoutineDetail";
import MySavedRoutines from "./pages/MySavedRoutines/MySavedRoutines";
import WorkoutCalendar from "./pages/WorkoutCalendar/WorkoutCalendar";
import MealsCalendar from "./pages/MealsCalendar/MealsCalendar";
import Statistics from "./pages/Statistics/Statistics";
import "./App.css";

// Componente para scroll al top en cada cambio de ruta
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <ActiveWorkoutProvider>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Rutas con layout (Header + BottomNav) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/routines/new" element={<RoutineForm />} />
            <Route path="/routine/:id" element={<RoutineDetail />} />
            <Route path="/routine-builder" element={<RoutineBuilder />} />
            <Route path="/workout-hub" element={<WorkoutHub />} />
            <Route path="/workout" element={<WorkoutPage />} />
            <Route path="/workout/ending" element={<WorkoutPageEnding />} />
            <Route path="/workout/:id" element={<WorkoutCompleted />} />
            <Route path="/meal-hub" element={<MealHub />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/diets/new" element={<DietForm />} />
            <Route path="/diets/:id/edit" element={<DietForm />} />
            <Route path="/diets/:id" element={<DietDetail />} />
            <Route path="/all-exercises" element={<AllExercises />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/profile" element={<MyAccount />} />
            <Route path="/my-saved-routines" element={<MySavedRoutines />} />
            <Route path="/calendar" element={<WorkoutCalendar />} />
            <Route path="/meals-calendar" element={<MealsCalendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/my-data" element={<MyData />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/:userId" element={<Chat />} />
            <Route path="/profile/:username" element={<UserProfile />} />
          </Route>

          {/* Rutas sin layout (Auth) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/fitcompa" element={<QrWizardPage />} />
          <Route path="/qr" element={<QrWizardPage />} />
        </Routes>
      </Router>
    </ActiveWorkoutProvider>
  );
}

export default App;
