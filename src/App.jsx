import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PacienteDashboard from "./pages/PacienteDashboard";
import CitasPaciente from "./pages/paciente/CitasPaciente";
import RecordatoriosPaciente from "./pages/paciente/RecordatoriosPaciente";
import HistorialPaciente from "./pages/paciente/HistorialPaciente";
import FamiliaresPaciente from "./pages/paciente/FamiliaresPaciente";

function App() {
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
