import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PacienteDashboard from "./pages/PacienteDashboard";
import CitasPaciente from "./pages/paciente/CitasPaciente";
import RecordatoriosPaciente from "./pages/paciente/RecordatoriosPaciente";
import HistorialPaciente from "./pages/paciente/HistorialPaciente";
import FamiliaresPaciente from "./pages/paciente/FamiliaresPaciente";

function App() {
  
  // 🔥 PRUEBA DE CONEXIÓN AL BACKEND SIN AFECTAR LA INTERFAZ
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    console.log("URL del backend:", API_URL);

    fetch(`${API_URL}/api/usuarios`)
      .then(res => res.json())
      .then(data => console.log("Usuarios desde backend:", data))
      .catch(err => console.error("Error llamando al backend:", err));
  }, []);

  return (
    <Routes>
      {/* Página principal */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Panel del Paciente */}
      <Route path="/paciente" element={<PacienteDashboard />} />
      <Route path="/paciente/citas" element={<CitasPaciente />} />
      <Route path="/paciente/recordatorios" element={<RecordatoriosPaciente />} />
      <Route path="/paciente/historial" element={<HistorialPaciente />} />
      <Route path="/paciente/familiares" element={<FamiliaresPaciente />} />
    </Routes>
  );
}

export default App;
