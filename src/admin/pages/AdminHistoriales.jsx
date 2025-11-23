import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { Paper, Button, TextField, Chip, Avatar, InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";

export default function AdminHistoriales() {
  const [historiales, setHistoriales] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const dedupePorPaciente = (list) => {
    const m = new Map();
    for (const h of list || []) {
      const key = (h.paciente || "").trim().toLowerCase();
      const prev = m.get(key);
      if (!prev || (Number(h.id) > Number(prev.id))) {
        m.set(key, h);
      }
    }
    return Array.from(m.values());
  };

  const cargar = async () => {
    // Intento 1: endpoint global (si está disponible)
    try {
      const { data } = await axios.get("http://localhost:8080/api/historial/todos");
      let rows = (data || []).map((h) => ({
        id: h.id,
        fecha: h.fecha,
        paciente: h.pacienteNombre,
        pacienteId: h.pacienteId,
        archivoNombre: h.archivoNombre || `historial-${h.id}.pdf`,
        archivoUrl: (h.archivoUrl && h.archivoUrl.startsWith("/"))
          ? `http://localhost:8080${h.archivoUrl}`
          : (h.archivoUrl || `http://localhost:8080/api/historial/${h.id}/pdf`),
      }));
      // Resolver pacienteId faltante con /api/usuarios (coincidencia exacta por nombre)
      if (rows.some(r => !r.pacienteId)) {
        try {
          const { data: usuarios } = await axios.get("http://localhost:8080/api/usuarios");
          const mapByName = (usuarios || []).reduce((acc, u) => { acc[(u.nombre || '').trim().toLowerCase()] = u.id; return acc; }, {});
          rows = rows.map(r => r.pacienteId ? r : ({ ...r, pacienteId: mapByName[(r.paciente || '').trim().toLowerCase()] }));
        } catch (_) {}
      }
      if (rows.length > 0) {
        setHistoriales(dedupePorPaciente(rows));
        return;
      }
    } catch (e) {
      // Si falla (p.ej., 400/404 porque el backend aún no expone /todos), usar fallback
      console.warn("/api/historial/todos no disponible; aplicando fallback por paciente", e?.response?.status);
    }

    // Fallback: obtener usuarios y agregar historiales por cada paciente
    try {
      const { data: usuarios } = await axios.get("http://localhost:8080/api/usuarios");
      const agregados = [];
      for (const u of usuarios || []) {
        try {
          const { data: historialDePaciente } = await axios.get(`http://localhost:8080/api/historial/${u.id}`);
          if ((historialDePaciente || []).length > 0) {
            (historialDePaciente || []).forEach((h) => {
              agregados.push({
                id: h.id,
                fecha: h.fecha,
                paciente: u.nombre,
                pacienteId: u.id,
                archivoNombre: `historial-${h.id}.pdf`,
                archivoUrl: `http://localhost:8080/api/historial/${h.id}/pdf`,
              });
            });
          } else {
            agregados.push({
              id: `paciente-${u.id}`,
              fecha: "-",
              paciente: u.nombre,
              archivoNombre: "Sin PDF",
              archivoUrl: null,
              pacienteId: u.id,
            });
          }
        } catch (_) {
          // Ignorar errores por paciente para no romper el agregado
        }
      }
      setHistoriales(dedupePorPaciente(agregados));
    } catch (e) {
      console.error("Error cargando usuarios para historial", e);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  useEffect(() => {
    const q = busqueda.toLowerCase();
    setFiltrados(
      historiales.filter(
        (h) =>
          (h.paciente || "").toLowerCase().includes(q) ||
          (h.archivoNombre || "").toLowerCase().includes(q)
      )
    );
  }, [busqueda, historiales]);

  const descargar = async (row) => {
    // Abre el PDF en nueva pestaña; el usuario puede ver/descargar
    if (row.archivoUrl) {
      // Generación local con el mismo diseño del paciente usando jsPDF
      if (row.pacienteId) {
        try {
          const [usrRes, recRes, citRes] = await Promise.all([
            axios.get(`http://localhost:8080/api/usuarios/${row.pacienteId}`),
            axios.get(`http://localhost:8080/api/recordatorios/usuario/${row.pacienteId}`),
            axios.get(`http://localhost:8080/api/citas/usuario/${row.pacienteId}`),
          ]);

          const usuario = usrRes.data || {};
          const recordatorios = (recRes.data || []).filter((r) => r.tomado);
          const citas = citRes.data || [];

          const doc = new jsPDF();
          const azul = [2, 132, 199];
          const grisFondo = [245, 247, 250];

          // Header
          doc.setFillColor(...azul);
          doc.rect(0, 0, 210, 25, "F");
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(20);
          doc.setFont("helvetica", "bold");
          doc.text("SALUD DIGITAL", 14, 17);
          doc.setFontSize(12);
          doc.setFont("helvetica", "normal");
          doc.text("Centro de Bienestar y Salud Integral", 200, 17, { align: "right" });

          // Título
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(16);
          doc.setFont("helvetica", "bold");
          doc.text(`Historial Médico de ${usuario?.nombre || row.paciente || "Paciente"}`, 105, 38, { align: "center" });
          doc.setDrawColor(...azul);
          doc.setLineWidth(0.8);
          doc.line(14, 42, 195, 42);

          // Datos del paciente
          doc.setFillColor(...grisFondo);
          doc.roundedRect(14, 48, 182, 25, 3, 3, "F");
          doc.setFont("helvetica", "bold");
          doc.setFontSize(12);
          doc.setTextColor(...azul);
          doc.text("Datos del Paciente", 16, 56);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(11);
          doc.text(`Nombre: ${usuario?.nombre || row.paciente || "No disponible"}`, 16, 63);
          doc.text(`Correo: ${usuario?.correo || "No disponible"}`, 16, 69);
          doc.text(`Fecha actual: ${new Date().toLocaleDateString()}`, 16, 75);

          // Medicaciones Tomadas
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...azul);
          doc.setFontSize(13);
          doc.text("Medicaciones Tomadas", 14, 90);
          const medicaciones = recordatorios.map((r) => [r.descripcion, (r.fechaHora || "").replace("T", " ")]);
          if (medicaciones.length > 0) {
            autoTable(doc, {
              startY: 94,
              head: [["Descripción", "Fecha y Hora"]],
              body: medicaciones,
              theme: "grid",
              headStyles: { fillColor: azul, textColor: 255, fontStyle: "bold", halign: "center" },
              alternateRowStyles: { fillColor: [230, 240, 250] },
              styles: { halign: "center" },
            });
          } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            doc.text("No se registran medicaciones tomadas.", 14, 98);
          }

          // Citas Registradas
          let y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 110;
          doc.setFont("helvetica", "bold");
          doc.setTextColor(...azul);
          doc.text("Citas Registradas", 14, y);
          if (citas.length > 0) {
            const tablaCitas = citas.map((c) => [c.motivo || "No especificado", c.fecha || "", c.hora || ""]);
            autoTable(doc, {
              startY: y + 4,
              head: [["Motivo", "Fecha", "Hora"]],
              body: tablaCitas,
              theme: "grid",
              headStyles: { fillColor: azul, textColor: 255, fontStyle: "bold", halign: "center" },
              alternateRowStyles: { fillColor: [230, 240, 250] },
              styles: { halign: "center" },
            });
          } else {
            doc.setFont("helvetica", "normal");
            doc.setTextColor(80);
            doc.text("No hay citas registradas.", 14, y + 6);
          }

          // Pie
          const endY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 20 : 270;
          doc.setDrawColor(220);
          doc.line(14, endY - 6, 195, endY - 6);
          doc.setFontSize(10);
          doc.setTextColor(120);
          doc.text("Salud Digital © 2025 — Reporte generado automáticamente.", 105, endY, { align: "center" });

          const nombre = (usuario?.nombre || row.paciente || "Paciente").replace(/\s+/g, "_");
          doc.save(`Historial_${nombre}.pdf`);
          return;
        } catch (e) {
          // Si algo falla, continúa con descarga del servidor
        }
      }

      const url = row.archivoUrl.startsWith("http") ? row.archivoUrl : `http://localhost:8080${row.archivoUrl}`;
      axios.get(url, { responseType: "blob" }).then((res) => {
        const fileURL = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
        const a = document.createElement("a");
        a.href = fileURL;
        a.download = row.archivoNombre || "historial.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(fileURL);
      }).catch(() => { window.open(url, "_blank"); });
      return;
    }
    if (row.pacienteId) {
      axios
        .post(`http://localhost:8080/api/historial/paciente/${row.pacienteId}/generar`)
        .then(() => cargar());
    }
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }} elevation={0}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: '#0ea5e9' }}>Historial Médico</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Consulta y descarga los reportes en PDF generados por paciente.</p>
          </div>
          <TextField
            size="small"
            label="Buscar por paciente/archivo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
          />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-sky-50 text-sky-700">
                <th className="p-3 border border-gray-200 text-left">Fecha</th>
                <th className="p-3 border border-gray-200 text-left">Nombre del paciente</th>
                <th className="p-3 border border-gray-200 text-left">Archivo</th>
                <th className="p-3 border border-gray-200 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((h) => (
                <tr key={h.id} className="hover:bg-sky-50">
                  <td className="p-3 border border-gray-200">{h.fecha}</td>
                  <td className="p-3 border border-gray-200">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Avatar sx={{ bgcolor: '#0ea5e9', width: 28, height: 28 }}>{(h.paciente || 'P').charAt(0).toUpperCase()}</Avatar>
                      <span style={{ color: '#0f172a', fontWeight: 500 }}>{h.paciente}</span>
                    </span>
                  </td>
                  <td className="p-3 border border-gray-200">
                    {h.archivoUrl ? (
                      <Chip label={h.archivoNombre} onClick={() => descargar(h)} sx={{ bgcolor: '#f0f9ff', color: '#0f172a', cursor: 'pointer' }} />
                    ) : (
                      <Chip label="Sin PDF" sx={{ bgcolor: '#fee2e2', color: '#7f1d1d' }} />
                    )}
                  </td>
                  <td className="p-3 border border-gray-200">
                    <Button variant="contained" onClick={() => descargar(h)} sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}>
                      {h.archivoUrl ? "Descargar PDF" : "Generar PDF"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtrados.length === 0 && (
          <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: 8, color: '#64748b' }}>
            No hay historiales para mostrar.
          </div>
        )}
      </Paper>
    </AdminLayout>
  );
}