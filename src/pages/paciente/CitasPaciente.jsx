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
      JSON.parse(localStorage.getItem("usuario")) ||
      JSON.parse(localStorage.getItem("user"));
    if (u) setUsuario(u);
  }, []);

  // (Eliminado) Carga dinámica de doctores desde backend

  // Refrescar citas automáticamente cada 5 segundos
  useEffect(() => {
    const cargarCitas = () => {
      const u =
        JSON.parse(localStorage.getItem("pacienteUsuario")) ||
        JSON.parse(localStorage.getItem("usuario")) ||
        JSON.parse(localStorage.getItem("user"));
      const id = u?.id;
      if (!id) return;
      axios
        .get(`http://localhost:8080/api/citas/usuario/${id}`)
        .then((res) => setCitas(res.data))
        .catch(() => setCitas([]));
    };

    cargarCitas(); // primera carga

    const intervalo = setInterval(() => {
      cargarCitas(); // refrescar cada 5 segundos
    }, 5000);

    return () => clearInterval(intervalo); // limpiar intervalo al salir
  }, []);

  const toISODateLocal = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario) {
      Swal.fire("Error", "No se encontró información del usuario.", "error");
      return;
    }
    if (!fecha || !hora || !medico || !motivo) {
      Swal.fire("Campos incompletos", "Completa todos los campos.", "warning");
      return;
    }

    const fechaISO = toISODateLocal(fecha);

    try {
      const res = await axios.post("http://localhost:8080/api/citas/crear", {
        usuarioId: usuario.id,
        fecha: fechaISO,
        hora: `${hora}:00`,
        medico,
        motivo,
      });

      if (res.data.includes("✅")) {
        await Swal.fire({
          icon: "success",
          title: "Cita registrada",
          text: "Tu cita fue guardada correctamente",
          confirmButtonColor: "#0284c7",
          confirmButtonText: "OK",
        });

        setFecha(null);
        setHora("");
        setMedico("");
        setMotivo("");

        const { data } = await axios.get(
          `http://localhost:8080/api/citas/usuario/${usuario.id}`
        );
        setCitas(data);

        // 🧾 Generar/actualizar PDF del historial del paciente para el admin
        try {
          await axios.post(`http://localhost:8080/api/historial/paciente/${usuario.id}/generar`);
        } catch (_) {}
      } else if (res.data.includes("❌")) {
        Swal.fire({
          icon: "error",
          title: "No disponible",
          text: res.data.replace("❌", ""),
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({
          icon: "info",
          title: "Aviso",
          text: res.data,
          confirmButtonColor: "#0ea5e9",
        });
      }
    } catch (err) {
      const msg = err?.response?.data || "No se pudo conectar con el servidor.";
      Swal.fire({
        icon: "error",
        title: msg.toString().includes("❌") ? "Error" : "Error al conectar",
        text: msg.toString().replace("❌", "").trim(),
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // ✅ Cancelar cita (funcional y elimina del historial)
  const cancelarCita = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Cancelar cita?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "No",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axios.delete(`http://localhost:8080/api/citas/${id}`);

        if (res.status === 200 || res.status === 204) {
          // Eliminar la cita del estado sin recargar
          setCitas((prev) => prev.filter((c) => c.id !== id));

          await Swal.fire({
            icon: "success",
            title: "Cita cancelada",
            text: "Tu cita ha sido eliminada correctamente.",
            confirmButtonColor: "#10b981",
          });

          // 🧾 Actualizar PDF del historial en el servidor
          try {
            await axios.post(`http://localhost:8080/api/historial/paciente/${usuario.id}/generar`);
          } catch (_) {}
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se pudo cancelar la cita.",
            confirmButtonColor: "#ef4444",
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Error al conectar",
          text: "No se pudo conectar con el servidor.",
          confirmButtonColor: "#ef4444",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eaf5ff] to-white py-10 px-5 flex flex-col items-center">
      {/* Encabezado con animación */}
      <div className="flex items-center gap-3 mb-8 animate__animated animate__fadeInDown">
        <FaStethoscope className="text-sky-600 text-4xl animate-bounce" />
        <h1 className="text-3xl md:text-4xl font-bold text-sky-700 drop-shadow-sm">
          Gestión de Citas Médicas
        </h1>
      </div>

      {/* Tarjeta principal */}
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-5xl animate__animated animate__fadeInUp transition-transform hover:scale-[1.01]">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
              calendarStartDay={1}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition-all"
            >
              <option value="">Seleccionar hora</option>
              {horasDisponibles.map((h) => (
                <option key={h} value={h}>
                  {h} AM
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white transition-all"
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
              placeholder="Ej: Control general"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none transition-all"
            />
          </div>

          {/* Botón */}
          <div className="col-span-1 md:col-span-2 text-center mt-4">
            <button
              type="submit"
              className="bg-sky-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-sky-700 transition-transform transform hover:scale-105 shadow-md"
            >
              Agendar Cita
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de citas */}
      <div className="w-full max-w-5xl mt-10 bg-white rounded-2xl shadow-md p-6 animate__animated animate__fadeInUp">
        <h2 className="text-xl font-bold text-sky-700 mb-4 flex items-center gap-2">
          <FaCalendarAlt className="text-sky-500" /> Mis Citas Registradas
        </h2>

        {citas.length === 0 ? (
          <p className="text-gray-500">No tienes citas registradas.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-100 text-sky-700 text-left">
                <th className="p-3">Fecha</th>
                <th className="p-3">Hora</th>
                <th className="p-3">Médico</th>
                <th className="p-3">Motivo</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citas.map((c) => (
                <tr
                  key={c.id}
                  className="border-b hover:bg-sky-50 transition-all duration-300"
                >
                  <td className="p-3">{c.fecha}</td>
                  <td className="p-3">{c.hora}</td>
                  <td className="p-3">{c.medico}</td>
                  <td className="p-3">{c.motivo}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => cancelarCita(c.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105"
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
        className="mt-8 px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
      >
        ← Volver al inicio
      </button>
    </div>
  );
}

export default CitasPaciente;
