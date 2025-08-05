import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/chat.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* Keep your background styling around App, if desired */}
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
          <App />
        </div>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
