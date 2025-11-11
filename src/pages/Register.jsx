import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.jpg";

function Register() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [tipo, setTipo] = useState("PACIENTE"); // Valor por defecto
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/api/auth/register", {
        nombre,
        correo,
        password,
        tipo,
      });

      // ✅ Backend devuelve { mensaje: "✅ Usuario registrado correctamente" }
      const respuesta = res.data?.mensaje || "";

      if (respuesta.includes("registrado correctamente")) {
        setMensaje("✅ Cuenta creada con éxito. Revisa tu correo para más detalles.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (respuesta.includes("Ya existe")) {
        setMensaje("⚠️ Ya existe una cuenta con ese correo.");
      } else {
        setMensaje("❌ Error desconocido al registrarse.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMensaje("⚠️ No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef6ff]">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        {/* --- Logo centrado --- */}
        <img
          src={logo}
          alt="Logo"
          className="mx-auto mb-4 w-20 h-20 object-contain rounded-full"
        />

        <h2 className="text-xl font-bold text-sky-600 mb-6">Crear Cuenta</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              placeholder="Ej: Anthony Cortez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              placeholder="Ej: usuario@gmail.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Tipo de usuario
            </label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none text-gray-800"
            >
              <option value="PACIENTE">Paciente</option>
              <option value="FAMILIAR">Familiar</option>
            </select>
          </div>

          <button
            type="submit"
            className="mt-4 w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Registrarse
          </button>
        </form>

        {mensaje && (
          <p
            className={`mt-4 text-sm font-medium ${
              mensaje.includes("éxito")
                ? "text-green-600"
                : mensaje.includes("Ya existe")
                ? "text-yellow-600"
                : mensaje.includes("conectar")
                ? "text-orange-600"
                : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}

        <p className="mt-6 text-sm text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-sky-600 hover:underline">
            Inicia Sesión
          </Link>
        </p>

        <p className="mt-2 text-sm">
          <Link to="/" className="text-sky-500 hover:underline">
            ⬅ Volver
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
