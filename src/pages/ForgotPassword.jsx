import { useState } from "react";
import axios from "axios";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Paso 1: enviar email/teléfono
  const handleSendCode = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/forgot-password", { email });
      setMensaje(res.data.message);
      setStep(2);
    } catch (err) {
      setError("Error enviando código");
    }
  };

  // Paso 2: verificar código
  const handleVerifyCode = (e) => {
    e.preventDefault();
    // 🔹 Aquí deberías verificar contra backend, por ahora simulamos
    if (codigo === "123456") {
      setStep(3);
      setError("");
    } else {
      setError("Código incorrecto");
    }
  };

  // Paso 3: resetear contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmar) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await axios.post("http://localhost:4000/reset-password", {
        email,
        password,
      });
      setMensaje(res.data.message);
      setStep(1); // lo reiniciamos al paso 1
    } catch (err) {
      setError("Error al cambiar contraseña");
    }
  };

  return (
    <div>
      <h2>Recuperar Contraseña</h2>

      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar código</button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyCode}>
          <input
            type="text"
            placeholder="Código de verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />
          <button type="submit">Verificar código</button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />
          <button type="submit">Restablecer contraseña</button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
      {mensaje && <p style={{ color: "green" }}>{mensaje}</p>}
    </div>
  );
}
