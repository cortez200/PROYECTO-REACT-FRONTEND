import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import logo from "../logo.jpg";

function Login() {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8080/api/auth/login", {
        correo,
        password,
      });

      // ✅ Si el backend devuelve correctamente el JSON
      if (res.status === 200 && res.data && res.data.mensaje?.includes("exitoso")) {
        const data = res.data;
        const tipo = data.tipo;

        // Guardar por rol para permitir sesiones simultáneas
        if (tipo === "ADMIN") {
          localStorage.setItem("adminUsuario", JSON.stringify(data));
        } else if (tipo === "PACIENTE") {
          localStorage.setItem("pacienteUsuario", JSON.stringify(data));
        }
        // Mantener compatibilidad
        localStorage.setItem("usuario", JSON.stringify(data));

        // Redirección según rol
        const destino = tipo === "ADMIN" ? "/admin" : tipo === "PACIENTE" ? "/paciente" : "/";

        setMensaje("✅ Inicio de sesión exitoso");
        setTimeout(() => navigate(destino), 800);
      } else {
        setMensaje("❌ Credenciales incorrectas");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setMensaje("❌ Credenciales incorrectas");
      } else {
        setMensaje("⚠️ Error al conectar con el servidor");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef6ff]">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md text-center">
        {/* --- Logo --- */}
        <img
          src={logo}
          alt="Logo"
          className="mx-auto mb-4 w-20 h-20 object-contain rounded-full"
        />

        <h2 className="text-xl font-bold text-sky-600 mb-6">Iniciar Sesión</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
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

          <button
            type="submit"
            className="mt-4 w-full bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700 transition"
          >
            Entrar
          </button>
        </form>

        {/* --- Mensaje de estado --- */}
        {mensaje && (
          <p
            className={`mt-4 text-sm font-medium ${
              mensaje.includes("✅")
                ? "text-green-600"
                : mensaje.includes("⚠️")
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {mensaje}
          </p>
        )}

        <p className="mt-6 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-sky-600 hover:underline">
            Regístrate
          </Link>
        </p>

        <p className="mt-2 text-sm text-gray-600">
          ¿Olvidaste tu contraseña?{" "}
          <Link to="/forgot-password" className="text-sky-600 hover:underline">
            Recuperar
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

export default Login;
