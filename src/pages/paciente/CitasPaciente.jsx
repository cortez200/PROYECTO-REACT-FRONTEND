import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUserMd,
  FaClock,
  FaCalendarAlt,
  FaClipboardList,
  FaStethoscope,
} from "react-icons/fa";
import DatePicker, { registerLocale } from "react-datepicker";
import es from "date-fns/locale/es";
import { useNavigate } from "react-router-dom";
import "animate.css";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("es", es);

function CitasPaciente() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [usuario, setUsuario] = useState(null);
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState("");
  const [medico, setMedico] = useState("");
  const [motivo, setMotivo] = useState("");
  const [citas, setCitas] = useState([]);

  const horasDisponibles = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00"];
  const doctores = ["Dr. Luis Paredes", "Dra. Andrea Ríos", "Dr. Julio Medina"];

  // Obtener usuario
  useEffect(() => {
    const u =
      JSON.parse(localStorage.getItem("pacienteUsuario")) ||
      JSON.parse(localStorage.getItem("usuario"));

    if (!u) {
      navigate("/login");
      return;
    }

    setUsuario(u);
  }, []);

  // Cargar citas del paciente
  useEffect(() => {
    if (!usuario) return;

    const cargarCitas = () => {
      axios
        .get(`${API_URL}/api/citas/usuario/${usuario.id}`)
        .then((res) => setCitas(res.data))
        .catch(() => setCitas([]));
    };

    cargarCitas();

    const intervalo = setInterval(cargarCitas, 5000);
    return () => clearInterval(intervalo);
  }, [usuario]);

  const toISODateLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Crear cita
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !hora || !medico || !motivo) {
      Swal.fire("Campos incompletos", "Completa todos los campos.", "warning");
      return;
    }

    const fechaISO = toISODateLocal(fecha);

    try {
      const res = await axios.post(`${API_URL}/api/citas/crear`, {
        usuarioId: usuario.id,
        fecha: fechaISO,
        hora: `${hora}:00`,
        medico,
        motivo,
      });

      await Swal.fire({
        icon: "success",
        title: "Cita registrada",
        text: "Tu cita fue registrada correctamente",
        confirmButtonColor: "#0284c7",
      });

      // Limpiar
      setFecha(null);
      setHora("");
      setMedico("");
      setMotivo("");

      // Recargar citas
      const { data } = await axios.get(`${API_URL}/api/citas/usuario/${usuario.id}`);
      setCitas(data);

      // Generar historial PDF
      try {
        await axios.post(`${API_URL}/api/historial/paciente/${usuario.id}/generar`);
      } catch (_) {}

    } catch (err) {
      Swal.fire("Error", "No se pudo registrar la cita.", "error");
    }
  };

  // Cancelar cita
  const cancelarCita = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#ef4444",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/api/citas/${id}`);

      setCitas((prev) => prev.filter((c) => c.id !== id));

      await Swal.fire({
        icon: "success",
        title: "Cita cancelada",
        confirmButtonColor: "#10b981",
      });

      // regenerar PDF
      try {
        await axios.post(`${API_URL}/api/historial/paciente/${usuario.id}/generar`);
      } catch (_) {}

    } catch {
      Swal.fire("Error", "No se pudo cancelar la cita.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf5ff] to-white py-10 px-5 flex flex-col items-center">

      {/* Título */}
      <div className="flex items-center gap-3 mb-8 animate__animated animate__fadeInDown">
        <FaStethoscope className="text-sky-600 text-4xl animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-bold text-sky-700">
          Gestión de Citas Médicas
        </h1>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl animate__animated animate__fadeInUp">
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {/* Fecha */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaCalendarAlt className="text-sky-500" /> Fecha
            </label>
            <DatePicker
              selected={fecha}
              onChange={(d) => setFecha(d)}
              dateFormat="dd/MM/yyyy"
              locale="es"
              minDate={new Date()}
              placeholderText="Seleccionar fecha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaClock className="text-sky-500" /> Hora
            </label>
            <select
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Seleccionar hora</option>
              {horasDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Médico */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaUserMd className="text-sky-500" /> Doctor
            </label>
            <select
              value={medico}
              onChange={(e) => setMedico(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Seleccionar médico</option>
              {doctores.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Motivo */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-1">
              <FaClipboardList className="text-sky-500" /> Motivo
            </label>
            <input
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Control general"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>

          {/* Botón */}
          <div className="col-span-1 md:col-span-2 text-center mt-4">
            <button
              type="submit"
              className="bg-sky-600 text-white px-8 py-2 rounded-lg hover:bg-sky-700"
            >
              Agendar Cita
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de citas */}
      <div className="w-full max-w-5xl mt-10 bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-sky-700 mb-4">
          <FaCalendarAlt className="inline text-sky-500 mr-2" />
          Mis Citas Registradas
        </h2>

        {citas.length === 0 ? (
          <p className="text-gray-500">No tienes citas registradas.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-100 text-sky-700">
                <th className="p-3">Fecha</th>
                <th className="p-3">Hora</th>
                <th className="p-3">Médico</th>
                <th className="p-3">Motivo</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr key={c.id} className="border-b hover:bg-sky-50">
                  <td className="p-3">{c.fecha}</td>
                  <td className="p-3">{c.hora}</td>
                  <td className="p-3">{c.medico}</td>
                  <td className="p-3">{c.motivo}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => cancelarCita(c.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <button
        onClick={() => navigate("/paciente")}
        className="mt-8 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
      >
        ← Volver al inicio
      </button>
    </div>
  );
}

export default CitasPaciente;
