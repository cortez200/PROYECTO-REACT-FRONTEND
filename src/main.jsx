import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import PacienteDashboard from "./pages/PacienteDashboard";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminPacientes from "./admin/pages/AdminPacientes";
import AdminCitas from "./admin/pages/AdminCitas";
import AdminRecordatorios from "./admin/pages/AdminRecordatorios";
import AdminHistoriales from "./admin/pages/AdminHistoriales";
import "./index.css";
import "react-datepicker/dist/react-datepicker.css";

/**
 * 🔒 Ruta privada para restringir acceso a usuarios autenticados
 * y con roles específicos.
 */
function PrivateRoute({ children, allowedRoles }) {
  const adminUser = JSON.parse(localStorage.getItem("adminUsuario") || "null");
  const patientUser = JSON.parse(localStorage.getItem("pacienteUsuario") || "null");
  const generic = JSON.parse(localStorage.getItem("usuario") || "null");

  let user = null;
  if (allowedRoles?.includes("ADMIN")) {
    user = adminUser || (generic?.tipo === "ADMIN" ? generic : null);
  } else if (allowedRoles?.includes("PACIENTE")) {
    user = patientUser || (generic?.tipo === "PACIENTE" ? generic : null);
  } else {
    user = generic || adminUser || patientUser;
  }

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.tipo)) return <Navigate to="/login" replace />;
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

        {/* Panel Administrador protegido */}
        <Route
          path="/admin"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/pacientes"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminPacientes />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/citas"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminCitas />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/recordatorios"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminRecordatorios />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/historial"
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <AdminHistoriales />
            </PrivateRoute>
          }
        />

        {/* Redirección si no existe ruta */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
