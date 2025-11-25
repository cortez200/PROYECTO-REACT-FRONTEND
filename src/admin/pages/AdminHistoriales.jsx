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

  // ✔ API desde .env
  const API_URL = import.meta.env.VITE_API_URL;

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
    try {
      const { data } = await axios.get(`${API_URL}/api/historial/todos`);

      let rows = (data || []).map((h) => ({
        id: h.id,
        fecha: h.fecha,
        paciente: h.pacienteNombre,
        pacienteId: h.pacienteId,
        archivoNombre: h.archivoNombre || `historial-${h.id}.pdf`,
        archivoUrl: h.archivoUrl
          ? `${API_URL}${h.archivoUrl}`
          : `${API_URL}/api/historial/${h.id}/pdf`,
      }));

      // Resolver pacienteId faltante
      if (rows.some((r) => !r.pacienteId)) {
        const { data: usuarios } = await axios.get(`${API_URL}/api/usuarios`);
        const mapByName = usuarios.reduce((acc, u) => {
          acc[u.nombre.trim().toLowerCase()] = u.id;
          return acc;
        }, {});
        rows = rows.map((r) =>
          r.pacienteId
            ? r
            : { ...r, pacienteId: mapByName[r.paciente.trim().toLowerCase()] }
        );
      }

      setHistoriales(dedupePorPaciente(rows));
      return;
    } catch (e) {
      console.warn("❗ Endpoint /api/historial/todos no disponible, haciendo fallback…");
    }

    // Fallback: historial por cada paciente
    try {
      const { data: usuarios } = await axios.get(`${API_URL}/api/usuarios`);
      const agregados = [];

      for (const u of usuarios) {
        try {
          const { data: historialPaciente } = await axios.get(`${API_URL}/api/historial/${u.id}`);

          if (historialPaciente.length > 0) {
            historialPaciente.forEach((h) =>
              agregados.push({
                id: h.id,
                fecha: h.fecha,
                paciente: u.nombre,
                pacienteId: u.id,
                archivoNombre: `historial-${h.id}.pdf`,
                archivoUrl: `${API_URL}/api/historial/${h.id}/pdf`,
              })
            );
          } else {
            agregados.push({
              id: `p-${u.id}`,
              fecha: "-",
              paciente: u.nombre,
              pacienteId: u.id,
              archivoNombre: "Sin PDF",
              archivoUrl: null,
            });
          }
        } catch (_) {}
      }

      setHistoriales(dedupePorPaciente(agregados));
    } catch (e) {
      console.error("Error cargando fallback:", e);
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
          h.paciente.toLowerCase().includes(q) ||
          h.archivoNombre.toLowerCase().includes(q)
      )
    );
  }, [busqueda, historiales]);

  const descargar = async (row) => {
    // Generar PDF local
    if (row.pacienteId) {
      try {
        const [usrRes, recRes, citRes] = await Promise.all([
          axios.get(`${API_URL}/api/usuarios/${row.pacienteId}`),
          axios.get(`${API_URL}/api/recordatorios/usuario/${row.pacienteId}`),
          axios.get(`${API_URL}/api/citas/usuario/${row.pacienteId}`),
        ]);

        const usuario = usrRes.data;
        const recordatorios = recRes.data.filter((r) => r.tomado);
        const citas = citRes.data;

        const doc = new jsPDF();

        const azul = [2, 132, 199];
        const grisFondo = [245, 247, 250];

        // HEADER
        doc.setFillColor(...azul);
        doc.rect(0, 0, 210, 25, "F");
        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.text("SALUD DIGITAL", 14, 17);

        // TÍTULO
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(`Historial Médico de ${usuario.nombre}`, 105, 38, { align: "center" });

        // DATOS PACIENTE
        doc.setFillColor(...grisFondo);
        doc.roundedRect(14, 48, 182, 25, 3, 3, "F");
        doc.setFontSize(11);
        doc.text(`Nombre: ${usuario.nombre}`, 16, 63);
        doc.text(`Correo: ${usuario.correo}`, 16, 69);

        // MEDICACIONES
        doc.setFontSize(14);
        doc.setTextColor(...azul);
        doc.text("Medicaciones Tomadas", 14, 90);

        if (recordatorios.length > 0) {
          autoTable(doc, {
            startY: 95,
            head: [["Descripción", "Fecha"]],
            body: recordatorios.map((r) => [r.descripcion, r.fechaHora]),
          });
        }

        // CITAS
        const startY = doc.lastAutoTable?.finalY + 20 || 120;
        doc.setTextColor(...azul);
        doc.text("Citas Registradas", 14, startY);

        if (citas.length > 0) {
          autoTable(doc, {
            startY: startY + 5,
            head: [["Motivo", "Fecha", "Hora"]],
            body: citas.map((c) => [c.motivo, c.fecha, c.hora]),
          });
        }

        const nombre = usuario.nombre.replace(/\s+/g, "_");
        doc.save(`Historial_${nombre}.pdf`);
        return;
      } catch (e) {
        console.warn("PDF local falló, intentando descargar del servidor…");
      }
    }

    // DESCARGA PDF DEL BACKEND
    if (row.archivoUrl) {
      axios
        .get(row.archivoUrl, { responseType: "blob" })
        .then((res) => {
          const url = URL.createObjectURL(res.data);
          const a = document.createElement("a");
          a.href = url;
          a.download = row.archivoNombre;
          document.body.appendChild(a);
          a.click();
          a.remove();
        })
        .catch(() => window.open(row.archivoUrl, "_blank"));
    }
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: "#0ea5e9" }}>Historial Médico</h2>
            <p style={{ margin: 0, color: "#64748b" }}>
              Consulta y descarga los PDF generados por paciente.
            </p>
          </div>

          <TextField
            size="small"
            label="Buscar por paciente/archivo"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
          />
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-sky-50 text-sky-700">
              <th className="p-3 border">Fecha</th>
              <th className="p-3 border">Paciente</th>
              <th className="p-3 border">Archivo</th>
              <th className="p-3 border">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {filtrados.map((h) => (
              <tr key={h.id} className="hover:bg-sky-50">
                <td className="p-3 border">{h.fecha}</td>
                <td className="p-3 border">
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Avatar sx={{ bgcolor: "#0284c7" }}>
                      {h.paciente.charAt(0).toUpperCase()}
                    </Avatar>
                    {h.paciente}
                  </span>
                </td>

                <td className="p-3 border">
                  {h.archivoUrl ? (
                    <Chip
                      label={h.archivoNombre}
                      onClick={() => descargar(h)}
                      sx={{ cursor: "pointer", bgcolor: "#f0f9ff" }}
                    />
                  ) : (
                    <Chip label="Sin PDF" sx={{ bgcolor: "#fee2e2", color: "#7f1d1d" }} />
                  )}
                </td>

                <td className="p-3 border">
                  <Button
                    variant="contained"
                    onClick={() => descargar(h)}
                    sx={{ bgcolor: "#0284c7" }}
                  >
                    {h.archivoUrl ? "Descargar PDF" : "Generar PDF"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>
    </AdminLayout>
  );
}
