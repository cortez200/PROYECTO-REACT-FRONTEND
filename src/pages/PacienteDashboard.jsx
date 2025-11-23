import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Pill,
  FileText,
  Users,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

function PacienteDashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("pacienteUsuario")) || JSON.parse(localStorage.getItem("usuario"));
  const [saludo, setSaludo] = useState("");

  // Saludo dinámico
  useEffect(() => {
    const hora = new Date().getHours();
    if (hora < 12) setSaludo("Buenos días");
    else if (hora < 18) setSaludo("Buenas tardes");
    else setSaludo("Buenas noches");
  }, []);

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, [navigate, usuario]);

  if (!usuario) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gradient-to-br from-[#f3f9ff] via-[#f7fbff] to-[#e8f4ff] transition">
      {/* 🩺 Header */}
      <header className="backdrop-blur-md bg-white/70 shadow-sm border-b border-gray-200 py-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-sky-700 tracking-tight">
          Salud Digital
        </h1>

        <div className="flex items-center gap-4">
          <div className="flex items-center text-sky-700 font-semibold">
            <UserCircle2 className="w-5 h-5 mr-1 text-sky-500" />
            {usuario.nombre
              ? `Hola, ${usuario.nombre.split(" ")[0].toUpperCase()}`
              : "Hola, PACIENTE"}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("pacienteUsuario");
              navigate("/login");
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-1 transition"
          >
            <LogOut size={16} /> Salir
          </button>
        </div>
      </header>

      {/* 💬 Bienvenida */}
      <section className="text-center py-10 px-4">
        <motion.h2
          className="text-3xl font-semibold text-sky-700 mb-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {saludo}, {usuario.nombre?.split(" ")[0]?.toUpperCase()}!
        </motion.h2>

        <motion.p
          className="text-gray-600 max-w-xl mx-auto text-sm sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Gestiona tus citas, recordatorios y familiares de forma simple y segura.
        </motion.p>
      </section>

      {/* 📦 Panel principal */}
      <main className="flex flex-wrap justify-center gap-6 px-4 sm:px-10 pb-16">
        {[
          {
            icon: CalendarDays,
            title: "Agenda de Citas",
            desc: "Gestiona tus citas médicas fácilmente.",
            btn: "Agendar ahora",
            path: "/paciente/citas",
          },
          {
            icon: Pill,
            title: "Recordatorios",
            desc: "Activa alertas para tus medicinas.",
            btn: "Activar recordatorios",
            path: "/paciente/recordatorios",
          },
          {
            icon: FileText,
            title: "Historial Médico",
            desc: "Consulta tus diagnósticos y tratamientos.",
            btn: "Ver historial",
            path: "/paciente/historial",
          },
          {
            icon: Users,
            title: "Notificar a Familiares",
            desc: "Envía avisos a tus familiares.",
            btn: "Configurar avisos",
            path: "/paciente/familiares",
          },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            className="bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:scale-105 transition-all rounded-2xl p-8 w-full sm:w-[280px] flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * idx }}
          >
            <item.icon className="w-12 h-12 text-sky-600 mb-4 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              {item.desc}
            </p>
            <button
              onClick={() => navigate(item.path)}
              className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2 rounded-lg font-medium transition text-sm sm:text-base"
            >
              {item.btn}
            </button>
          </motion.div>
        ))}
      </main>

      {/* ⚪ Footer */}
      <footer className="bg-white/80 border-t border-gray-200 text-center py-4 text-gray-500 text-sm mt-auto">
        © {new Date().getFullYear()} Salud Digital — Todos los derechos reservados.
      </footer>
    </div>
  );
}

export default PacienteDashboard;
