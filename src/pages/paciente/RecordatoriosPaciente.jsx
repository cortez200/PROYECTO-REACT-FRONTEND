import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaPills,
  FaClock,
  FaPlusCircle,
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaTrash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from "date-fns/locale";
import confetti from "canvas-confetti";

registerLocale("es", es);

function parse12hTo24h(hhmm, ampm) {
  let [h, m] = hhmm.split(":").map(Number);
  if (ampm === "AM" && h === 12) h = 0;
  if (ampm === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
}

export default function RecordatoriosPaciente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [medicina, setMedicina] = useState("");
  const [dosis, setDosis] = useState("");
  const [fecha, setFecha] = useState(null);
  const [hora, setHora] = useState("08:00");
  const [ampm, setAmpm] = useState("AM");
  const [recordatorios, setRecordatorios] = useState([]);

  useEffect(() => {
    const u =
      JSON.parse(localStorage.getItem("usuario")) ||
      JSON.parse(localStorage.getItem("user"));
    setUsuario(u || null);
  }, []);

  useEffect(() => {
    if (!usuario?.id) return;
    axios
      .get(`http://localhost:8080/api/recordatorios/usuario/${usuario.id}`)
      .then((res) => setRecordatorios(res.data || []))
      .catch(() => setRecordatorios([]));
  }, [usuario]);

  const handleAgregar = async () => {
    if (!usuario?.id) {
      Swal.fire("Error", "No se encontró el usuario.", "error");
      return;
    }
    if (!medicina.trim() || !dosis.trim() || !fecha || !hora) {
      Swal.fire("Campos incompletos", "Completa todos los campos.", "warning");
      return;
    }

    const fechaISO = fecha.toISOString().split("T")[0];
    const h24 = parse12hTo24h(hora, ampm);
    const body = {
      usuarioId: usuario.id,
      descripcion: `${medicina} — ${dosis}`,
      fechaHora: `${fechaISO}T${h24}`,
    };

    try {
      const res = await axios.post("http://localhost:8080/api/recordatorios", body);
      if (res.status === 200 || res.status === 201) {
        Swal.fire("✅ Éxito", "Recordatorio creado correctamente.", "success");
        setMedicina("");
        setDosis("");
        setFecha(null);
        setHora("08:00");
        setAmpm("AM");
        recargar();
      }
    } catch {
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const recargar = async () => {
    const { data } = await axios.get(
      `http://localhost:8080/api/recordatorios/usuario/${usuario.id}`
    );
    setRecordatorios(data || []);
  };

  const borrar = async (id) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: "¿Eliminar recordatorio?",
      text: "Esta acción no se puede deshacer.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "No",
      confirmButtonColor: "#ef4444",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/api/recordatorios/${id}`);
      setRecordatorios((prev) => prev.filter((r) => r.id !== id));
      Swal.fire("Eliminado", "Recordatorio eliminado correctamente.", "success");
    } catch {
      Swal.fire("Error", "No se pudo conectar con el servidor.", "error");
    }
  };

  const marcarTomado = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/recordatorios/${id}/tomado`);
      Swal.fire({
        icon: "success",
        title: "✅ Medicamento tomado",
        text: "Se ha marcado correctamente como tomado.",
        confirmButtonColor: "#22c55e",
      });

      // 🎉 Efecto de confeti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.7 },
        colors: ["#22c55e", "#4ade80", "#86efac", "#16a34a"],
      });

      recargar();
    } catch {
      Swal.fire("Error", "No se pudo actualizar el recordatorio.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff]">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Encabezado */}
        <motion.div
          className="flex flex-col items-center mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, -15, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl text-sky-600 mb-2"
          >
            <FaPills />
          </motion.div>
          <h1 className="text-3xl font-bold text-sky-700">
            Recordatorios de Medicinas
          </h1>
        </motion.div>

        {/* Formulario */}
        <div className="bg-white shadow-md rounded-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">Medicina</label>
              <input
                value={medicina}
                onChange={(e) => setMedicina(e.target.value)}
                placeholder="Ej: Losartán"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Dosis</label>
              <input
                value={dosis}
                onChange={(e) => setDosis(e.target.value)}
                placeholder="Ej: 50 mg"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Fecha</label>
              <DatePicker
                selected={fecha}
                onChange={(date) => setFecha(date)}
                locale="es"
                dateFormat="dd/MM/yyyy"
                placeholderText="Seleccionar fecha"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                minDate={new Date()}
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">Hora</label>
              <div className="flex gap-3">
                <input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                />
                <select
                  value={ampm}
                  onChange={(e) => setAmpm(e.target.value)}
                  className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option>AM</option>
                  <option>PM</option>
                </select>
              </div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleAgregar}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              <FaPlusCircle /> Agregar recordatorio
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white shadow-sm rounded-2xl p-6 mt-8">
          <h3 className="text-lg font-bold text-sky-700 mb-4 text-center">
            Mis recordatorios
          </h3>
          {recordatorios.length === 0 ? (
            <p className="text-gray-500 text-center">Aún no tienes recordatorios.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-sky-100 text-sky-700 text-left">
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recordatorios.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-sky-50 transition">
                    <td className="p-3">{r.descripcion}</td>
                    <td className="p-3">{r.fechaHora?.replace("T", " ")}</td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => marcarTomado(r.id)}
                        disabled={r.tomado}
                        className={`px-3 py-1 rounded text-white font-medium transition ${
                          r.tomado
                            ? "bg-green-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                        }`}
                      >
                        <FaCheckCircle className="inline mr-1" />
                        {r.tomado ? "Tomado" : "Marcar Tomado"}
                      </button>
                      <button
                        onClick={() => borrar(r.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
                      >
                        <FaTrash className="inline mr-1" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/paciente")}
            className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FaArrowLeft /> Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
