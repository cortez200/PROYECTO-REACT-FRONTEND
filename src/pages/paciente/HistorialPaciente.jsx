import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { motion } from "framer-motion";
import {
  FaNotesMedical,
  FaUser,
  FaPills,
  FaCalendarAlt,
  FaFilePdf,
} from "react-icons/fa";

export default function HistorialPaciente() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [recordatorios, setRecordatorios] = useState([]);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    const u =
      JSON.parse(localStorage.getItem("pacienteUsuario")) ||
      JSON.parse(localStorage.getItem("usuario")) ||
      JSON.parse(localStorage.getItem("user"));
    setUsuario(u || null);

    if (u?.id) {
      axios
        .get(`http://localhost:8080/api/recordatorios/usuario/${u.id}`)
        .then((res) => setRecordatorios(res.data || []))
        .catch(() => setRecordatorios([]));

      axios
        .get(`http://localhost:8080/api/citas/usuario/${u.id}`)
        .then((res) => setCitas(res.data || []))
        .catch(() => setCitas([]));
    }
  }, []);

  // 🧾 FUNCIÓN PARA DESCARGAR PDF
  const descargarPDF = () => {
    try {
      const doc = new jsPDF();
      const azul = [2, 132, 199];
      const grisFondo = [245, 247, 250];

      // 🩺 Encabezado
      doc.setFillColor(...azul);
      doc.rect(0, 0, 210, 25, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("SALUD DIGITAL", 14, 17);
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Centro de Bienestar y Salud Integral", 200, 17, { align: "right" });

      // 🧍 Título
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Historial Médico de ${usuario?.nombre || "Paciente"}`,
        105,
        38,
        { align: "center" }
      );

      doc.setDrawColor(...azul);
      doc.setLineWidth(0.8);
      doc.line(14, 42, 195, 42);

      // 📋 Datos del paciente
      doc.setFillColor(...grisFondo);
      doc.roundedRect(14, 48, 182, 25, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...azul);
      doc.text("Datos del Paciente", 16, 56);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.text(`Nombre: ${usuario?.nombre || "No disponible"}`, 16, 63);
      doc.text(`Correo: ${usuario?.correo || "No disponible"}`, 16, 69);
      doc.text(`Fecha actual: ${new Date().toLocaleDateString()}`, 16, 75);

      // 💊 Medicaciones Tomadas
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...azul);
      doc.setFontSize(13);
      doc.text("Medicaciones Tomadas", 14, 90);

      const medicaciones = recordatorios
        .filter((r) => r.tomado)
        .map((r) => [r.descripcion, r.fechaHora.replace("T", " ")]);

      if (medicaciones.length > 0) {
        autoTable(doc, {
          startY: 94,
          head: [["Descripción", "Fecha y Hora"]],
          body: medicaciones,
          theme: "grid",
          headStyles: {
            fillColor: azul,
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          alternateRowStyles: { fillColor: [230, 240, 250] },
          styles: { halign: "center" },
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text("No se registran medicaciones tomadas.", 14, 98);
      }

      // 📅 Citas Registradas
      let y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 110;
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...azul);
      doc.text("Citas Registradas", 14, y);

      if (citas.length > 0) {
        const tablaCitas = citas.map((c) => [
          c.motivo || "No especificado",
          c.fecha || "",
          c.hora || "",
        ]);
        autoTable(doc, {
          startY: y + 4,
          head: [["Motivo", "Fecha", "Hora"]],
          body: tablaCitas,
          theme: "grid",
          headStyles: {
            fillColor: azul,
            textColor: 255,
            fontStyle: "bold",
            halign: "center",
          },
          alternateRowStyles: { fillColor: [230, 240, 250] },
          styles: { halign: "center" },
        });
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(80);
        doc.text("No tienes citas registradas.", 14, y + 6);
      }

      // 🧾 Pie de página
      const endY = doc.lastAutoTable?.finalY
        ? doc.lastAutoTable.finalY + 20
        : 270;
      doc.setDrawColor(220);
      doc.line(14, endY - 6, 195, endY - 6);
      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(
        "Salud Digital © 2025 — Reporte generado automáticamente.",
        105,
        endY,
        { align: "center" }
      );

      doc.save(
        `Historial_${usuario?.nombre?.replace(/\s+/g, "_") || "Paciente"}.pdf`
      );

      if (usuario?.id) {
        axios
          .post(`http://localhost:8080/api/historial/paciente/${usuario.id}/generar`)
          .catch(() => {});
      }
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
      alert("Error al generar el PDF. Revisa la consola.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f9ff] py-6 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Encabezado centrado con animación */}
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
            <FaNotesMedical />
          </motion.div>
          <h1 className="text-3xl font-bold text-sky-700">Historial Médico</h1>
        </motion.div>

        {/* Datos del paciente */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <FaUser className="text-sky-600" /> Datos del Paciente
          </h2>
          <p>
            <b>Nombre:</b> {usuario?.nombre || "No disponible"}
          </p>
          <p>
            <b>Correo:</b> {usuario?.correo || "No disponible"}
          </p>
          <p>
            <b>Fecha actual:</b> {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Medicación tomada */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <FaPills className="text-sky-600" /> Medicación Tomada
          </h2>
          {recordatorios.filter((r) => r.tomado).length === 0 ? (
            <p className="text-gray-500">Aún no registras tomas de medicación.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-sky-100 text-sky-700 text-left">
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Fecha y Hora</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {recordatorios
                  .filter((r) => r.tomado)
                  .map((r) => (
                    <tr key={r.id} className="border-b hover:bg-sky-50">
                      <td className="p-3">{r.descripcion}</td>
                      <td className="p-3">{r.fechaHora.replace("T", " ")}</td>
                      <td className="p-3 text-green-600 font-semibold">✅ Tomado</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Citas registradas */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h2 className="text-lg font-semibold text-sky-700 mb-3 flex items-center gap-2">
            <FaCalendarAlt className="text-sky-600" /> Citas Registradas
          </h2>
          {citas.length === 0 ? (
            <p className="text-gray-500">Aún no tienes citas registradas.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-sky-100 text-sky-700 text-left">
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Hora</th>
                </tr>
              </thead>
              <tbody>
                {citas.map((c, i) => (
                  <tr key={i} className="border-b hover:bg-sky-50">
                    <td className="p-3">{c.motivo || "No especificado"}</td>
                    <td className="p-3">{c.fecha}</td>
                    <td className="p-3">{c.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Botón PDF */}
        <div className="text-center">
          <button
            onClick={descargarPDF}
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-lg font-semibold"
          >
            <FaFilePdf /> Descargar Historial en PDF
          </button>
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
