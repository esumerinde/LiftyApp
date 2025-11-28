import { useEffect } from "react";
import FitCompaWizard from "../../QR/components/FitCompaWizard";
import "../../QR/index.css";

const FitCompaWizardPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  return <FitCompaWizard />;
};

export default FitCompaWizardPage;
