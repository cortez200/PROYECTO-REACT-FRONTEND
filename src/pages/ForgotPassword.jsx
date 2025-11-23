import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const enviarCodigo = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      const res = await axios.post("http://localhost:8080/api/auth/forgot-password", { correo });
      const msg = res.data?.mensaje || "Código enviado al correo";
      setMensaje(msg);
    } catch (err) {
      setMensaje("No se pudo enviar el código. Si tu correo está registrado, intenta verificar en tu bandeja.");
    }
    setStep(2);
  };

  const verificarCodigo = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    try {
      const res = await axios.post("http://localhost:8080/api/auth/verify-code", { correo, codigo });
      if (res.status === 200) {
        setMensaje("Código verificado. Ingresa tu nueva contraseña.");
        setStep(3);
      }
    } catch (err) {
      setError((err?.response?.data?.mensaje) || "Código incorrecto o expirado");
    }
  };

  const resetear = async (e) => {
    e.preventDefault();
    setError(""); setMensaje("");
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }
    try {
      const res = await axios.post("http://localhost:8080/api/auth/reset-password", { correo, codigo, password });
      setMensaje(res.data?.mensaje || "Contraseña actualizada");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError((err?.response?.data?.mensaje) || "Error al cambiar contraseña");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#eef6ff] px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-sky-600 mb-4 text-center">Recuperar Contraseña</h2>

        {step === 1 && (
          <form onSubmit={enviarCodigo} className="flex flex-col gap-4">
            <label className="text-sm text-gray-600">Correo</label>
            <input
              type="email"
              placeholder="Ej: usuario@gmail.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button type="submit" className="bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700">Enviar código</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={verificarCodigo} className="flex flex-col gap-4">
            <label className="text-sm text-gray-600">Código de 5 dígitos</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{5}"
              placeholder="Ej: 12345"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 5))}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button type="submit" className="bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700">Verificar código</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={resetear} className="flex flex-col gap-4">
            <label className="text-sm text-gray-600">Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <label className="text-sm text-gray-600">Confirmar contraseña</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              minLength={6}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button type="submit" className="bg-sky-600 text-white py-2 rounded-lg font-semibold hover:bg-sky-700">Restablecer contraseña</button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}
        {mensaje && <p className="mt-4 text-sm text-green-600 text-center">{mensaje}</p>}

        <p className="mt-6 text-sm text-center">
          <Link to="/login" className="text-sky-600 hover:underline">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  );
}
