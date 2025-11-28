import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import { MessagesProvider } from "./context/MessagesContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <MessagesProvider>
        <App />
      </MessagesProvider>
    </AuthProvider>
  </StrictMode>
);
