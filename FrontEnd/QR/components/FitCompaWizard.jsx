import { useState } from "react";
import WelcomeScreen from "./WelcomeScreen";
import MultiStepForm from "./MultiStepForm";
import LoadingAnalysis from "./LoadingAnalysis";
import RecommendationScreen from "./RecommendationScreen";
import "./FitCompaWizard.css";

function FitCompaWizard() {
  const [currentView, setCurrentView] = useState("welcome");
  const [finalData, setFinalData] = useState(null);

  return (
    <div className="wizard-container">
      {currentView === "welcome" && (
        <WelcomeScreen onStart={() => setCurrentView("form")} />
      )}

      {currentView === "form" && (
        <MultiStepForm
          onComplete={(data) => {
            setFinalData(data);
            // Guardar datos en localStorage para usar en el registro
            localStorage.setItem("wizardData", JSON.stringify(data));
            setCurrentView("loading");
          }}
        />
      )}

      {currentView === "loading" && (
        <LoadingAnalysis onAnalysisComplete={() => setCurrentView("result")} />
      )}

      {currentView === "result" && (
        <RecommendationScreen formData={finalData} />
      )}
    </div>
  );
}

export default FitCompaWizard;
