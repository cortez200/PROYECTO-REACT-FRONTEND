import { useState, useEffect } from "react";
import axios from "axios";
import { FaUserPlus, FaUsers, FaEnvelope, FaToggleOn, FaToggleOff } from "react-icons/fa";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function NotificarFamiliares() {
  const navigate = useNavigate();
  const [alertasActivas, setAlertasActivas] = useState(true);
  const [familiares, setFamiliares] = useState([]);
  const [form, setForm] = useState({ nombre: "", relacion: "", correo: "" });
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("pacienteUsuario")) || JSON.parse(localStorage.getItem("usuario")) || JSON.parse(localStorage.getItem("user"));
    setUsuario(u || null);
    if (u?.id) cargarFamiliares(u.id);
  }, []);

  const cargarFamiliares = async (idUsuario) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/familiares/usuario/${idUsuario}`);
      setFamiliares(res.data || []);
    } catch (e) {
      console.error("Error cargando familiares", e);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const agregarFamiliar = async () => {
    if (!form.nombre || !form.correo || !form.relacion) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    try {
      const body = {
        usuarioId: usuario.id,
        nombre: form.nombre,
        correo: form.correo,
        relacion: form.relacion,
      };
      await axios.post("http://localhost:8080/api/familiares", body);
      setForm({ nombre: "", relacion: "", correo: "" });
      cargarFamiliares(usuario.id);
    } catch (e) {
      console.error("Error agregando familiar:", e);
      alert("Error al agregar familiar. Revisa la consola.");
    }
  };

  const eliminarFamiliar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este familiar?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/familiares/${id}`);
      cargarFamiliares(usuario.id);
    } catch (e) {
      console.error("Error eliminando familiar:", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff] py-6 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado animado */}
        <motion.div
          className="flex flex-col items-center mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-5xl text-sky-600 mb-2"
          >
            <FaUsers />
          </motion.div>
          <h1 className="text-3xl font-bold text-sky-700">Notificar a Familiares</h1>
        </motion.div>

        {/* Switch de alertas */}
        <div className="bg-white shadow-md rounded-xl p-4 mb-6 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-700">Alertas a familiares</h2>
            <p className="text-sm text-gray-500">
              Cuando no confirmes una toma, se enviará un aviso a tus contactos.
            </p>
          </div>
          <button
            onClick={() => setAlertasActivas(!alertasActivas)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              alertasActivas ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
            }`}
          >
            {alertasActivas ? <FaToggleOn size={22} /> : <FaToggleOff size={22} />}
            {alertasActivas ? "Activas" : "Inactivas"}
          </button>
        </div>

        {/* Formulario */}
        <div className="bg-white shadow-md rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-sky-700 mb-4 flex items-center gap-2">
            <FaUserPlus className="text-sky-600" /> Agregar familiar
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Ana López"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Relación</label>
              <input
                type="text"
                name="relacion"
                value={form.relacion}
                onChange={handleChange}
                placeholder="Ej: Madre, Hermano, Esposo"
                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Correo electrónico</label>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-sky-600" />
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={handleChange}
                  placeholder="ejemplo@mail.com"
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          </div>

          <button
            onClick={agregarFamiliar}
            className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg font-semibold flex items-center gap-2"
          >
            + Agregar
          </button>
        </div>

        {/* Lista de familiares */}
        <div className="bg-white shadow-md rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Contactos registrados</h2>
          {familiares.length === 0 ? (
            <p className="text-gray-500">Aún no has agregado familiares o contactos.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-sky-100 text-sky-700 text-left">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Relación</th>
                  <th className="p-3">Correo</th>
                  <th className="p-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {familiares.map((f) => (
                  <tr key={f.id} className="border-b hover:bg-sky-50">
                    <td className="p-3">{f.nombre}</td>
                    <td className="p-3">{f.relacion}</td>
                    <td className="p-3">{f.correo}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => eliminarFamiliar(f.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botón volver */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/paciente")}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-100 text-gray-700 px-4 py-2 hover:bg-gray-200 transition"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
