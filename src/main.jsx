import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PacienteDashboard from "./pages/PacienteDashboard";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

/**
 * 🔒 Ruta privada para restringir acceso a usuarios autenticados
 * y con roles específicos.
 */
function PrivateRoute({ children, allowedRoles }) {
  // Coincide con la clave usada en Login.jsx
  const user = JSON.parse(localStorage.getItem("usuario"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Verificar rol (el backend devuelve "tipo")
  if (allowedRoles && !allowedRoles.includes(user.tipo)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * 🚀 Configuración principal de rutas
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página principal (App maneja rutas internas) */}
        <Route path="/*" element={<App />} />

        {/* Autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Panel del Paciente protegido */}
        <Route
          path="/paciente"
          element={
            <PrivateRoute allowedRoles={["PACIENTE"]}>
              <PacienteDashboard />
            </PrivateRoute>
          }
        />

        {/* Redirección si no existe ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
