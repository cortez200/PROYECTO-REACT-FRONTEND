import "../App.css";
import portada from "../logo1.jpg";
import { useState } from "react";
import { Calendar, Pill, FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // 🔹 Scroll suave al inicio
  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* ===== ENCABEZADO ===== */}
      <header className="header">
        <div className="logo">Salud Digital</div>

        <nav className={`nav ${menuOpen ? "open" : ""}`}>
          <a href="#inicio" onClick={scrollToTop} className="nav-link">
            Inicio
          </a>
          <a href="#sobre-nosotros" className="nav-link">
            Sobre Nosotros
          </a>
          <a href="#servicios" className="nav-link">
            Servicios
          </a>
          <Link to="/login" className="nav-link">
            Iniciar Sesión
          </Link>
          <Link to="/register" className="nav-link">
            Registrarse
          </Link>
        </nav>

        <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
      </header>

      {/* ===== SECCIÓN HERO ===== */}
      <section id="inicio" className="hero">
        <img src={portada} alt="Imagen principal" className="hero-img" />
        <div className="hero-overlay"></div>
        <div className="hero-text">
          <h1>Tu Salud es nuestra prioridad</h1>
          <p>
            Agenda tus citas médicas y recibe recordatorios automáticos de tus
            medicinas. Tranquilidad y confianza para ti y tu familia.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn-primary">
              Agendar Cita
            </Link>
            <Link to="/register" className="btn-secondary">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN SOBRE NOSOTROS ===== */}
      <section id="sobre-nosotros" className="sobre-nosotros">
        <h2>Sobre Nosotros</h2>
        <p>
          En <strong>Salud Digital</strong> nos preocupamos por el bienestar de
          nuestros pacientes. Somos un hospital que combina la experiencia de
          profesionales altamente capacitados con la innovación tecnológica para
          facilitar la vida de los usuarios. Nuestra misión es brindar confianza,
          seguridad y accesibilidad a cada familia.
        </p>
      </section>

      {/* ===== SECCIÓN SERVICIOS ===== */}
      <section id="servicios" className="servicios">
        <h2 className="text-center text-sky-600 text-5xl font-bold mb-12">
          Nuestros Servicios
        </h2>

        {/* 🔹 Tarjetas grandes, centradas y sin espacio vacío */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full px-16 lg:px-24 max-w-[1600px] mx-auto">

          <div className="bg-white shadow-lg rounded-2xl p-10 text-center hover:shadow-xl transition-transform transform hover:-translate-y-2 min-h-[360px] flex flex-col justify-between">
            <div>
              <Calendar className="mx-auto mb-6 text-sky-600" size={60} />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Agenda de Citas</h3>
              <p className="text-gray-500 text-sm mb-6">
                Gestiona tus citas médicas de manera rápida y sencilla.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-sky-600 text-white px-6 py-2.5 rounded-lg hover:bg-sky-700 transition"
            >
              Agendar ahora
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-10 text-center hover:shadow-xl transition-transform transform hover:-translate-y-2 min-h-[360px] flex flex-col justify-between">
            <div>
              <Pill className="mx-auto mb-6 text-sky-600" size={60} />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Recordatorio de Medicinas</h3>
              <p className="text-gray-500 text-sm mb-6">
                Recibe alertas automáticas para no olvidar tu medicación.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-sky-600 text-white px-6 py-2.5 rounded-lg hover:bg-sky-700 transition"
            >
              Activar recordatorios
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-10 text-center hover:shadow-xl transition-transform transform hover:-translate-y-2 min-h-[360px] flex flex-col justify-between">
            <div>
              <FileText className="mx-auto mb-6 text-sky-600" size={60} />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Historial Médico</h3>
              <p className="text-gray-500 text-sm mb-6">
                Accede a tu información médica básica en cualquier momento.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-sky-600 text-white px-6 py-2.5 rounded-lg hover:bg-sky-700 transition"
            >
              Ver mi historial
            </Link>
          </div>

          <div className="bg-white shadow-lg rounded-2xl p-10 text-center hover:shadow-xl transition-transform transform hover:-translate-y-2 min-h-[360px] flex flex-col justify-between">
            <div>
              <Users className="mx-auto mb-6 text-sky-600" size={60} />
              <h3 className="text-xl font-bold text-gray-800 mb-3">Notificación a Familiares</h3>
              <p className="text-gray-500 text-sm mb-6">
                Envía avisos si no se confirma la toma de medicamentos.
              </p>
            </div>
            <Link
              to="/login"
              className="bg-sky-600 text-white px-6 py-2.5 rounded-lg hover:bg-sky-700 transition"
            >
              Configurar avisos
            </Link>
          </div>

        </div>
      </section>

      {/* ===== PIE DE PÁGINA ===== */}
      <footer id="contacto" className="footer">
        <p>© 2025 Salud+ | Todos los derechos reservados</p>
        <div className="footer-links">
          <a href="#inicio" onClick={scrollToTop}>
            Inicio
          </a>
          <a href="#sobre-nosotros">Sobre Nosotros</a>
          <a href="#servicios">Servicios</a>
          <Link to="/login">Login</Link>
          <Link to="/register">Registro</Link>
        </div>
      </footer>
    </>
  );
}

export default Home;
