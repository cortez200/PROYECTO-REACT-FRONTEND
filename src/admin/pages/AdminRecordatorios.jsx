import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Stack,
  Avatar,
  Chip,
  InputAdornment,
  Grid,
  Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MedicationIcon from "@mui/icons-material/Medication";
import ListAltIcon from "@mui/icons-material/ListAlt";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import axios from "axios";

export default function AdminRecordatorios() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [recordatorios, setRecordatorios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    id: null,
    usuarioId: "",
    medicina: "",
    dosis: "",
    fecha: "",
    hora: "",
    activo: true,
  });

  // ======================
  // CARGAR USUARIOS
  // ======================
  const cargarUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/usuarios`);
      setUsuarios(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // CARGAR RECORDATORIOS
  // ======================
  const cargarRecordatorios = () => {
    axios
      .get(`${API_URL}/api/recordatorios`)
      .then((res) => {
        const data = (res.data || []).map((r) => {
          const desc = r.descripcion || "";
          const [medicina, dosis] = desc.includes("—")
            ? desc.split("—").map((s) => s.trim())
            : [desc, ""];

          const fechaHora = r.fechaHora || "";
          const [fecha, time] = fechaHora.split("T");

          return {
            id: r.id,
            usuarioId: r.usuario?.id,
            paciente: r.usuario?.nombre || "Sin asignar",
            medicina: medicina || "",
            dosis: dosis || "",
            fecha: fecha || "",
            hora: (time || "").slice(0, 5),
            activo: r.activo !== false,
          };
        });

        setRecordatorios(data);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarRecordatorios();
    cargarUsuarios();
  }, []);

  // ======================
  // BUSCADOR
  // ======================
  useEffect(() => {
    const q = busqueda.toLowerCase();
    setFiltrados(
      recordatorios.filter(
        (r) =>
          r.paciente.toLowerCase().includes(q) ||
          r.medicina.toLowerCase().includes(q) ||
          r.dosis.toLowerCase().includes(q)
    ));
  }, [busqueda, recordatorios]);

  // ======================
  // GUARDAR / EDITAR
  // ======================
  const guardar = async () => {
    if (!form.usuarioId || !form.medicina || !form.dosis || !form.fecha || !form.hora) {
      alert("Completa todos los campos");
      return;
    }

    const descripcion = `${form.medicina} — ${form.dosis}`;
    const fechaHora = `${form.fecha}T${form.hora}:00`;

    const body = {
      usuarioId: form.usuarioId,
      descripcion,
      fechaHora,
    };

    try {
      if (editMode) {
        await axios.put(`${API_URL}/api/recordatorios/${form.id}`, body);
      } else {
        await axios.post(`${API_URL}/api/recordatorios`, body);
      }

      setOpenModal(false);
      cargarRecordatorios();
    } catch (err) {
      console.error(err);
      alert("Error al guardar el recordatorio");
    }
  };

  // ======================
  // ELIMINAR
  // ======================
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar recordatorio?")) return;

    try {
      await axios.delete(`${API_URL}/api/recordatorios/${id}`);
      cargarRecordatorios();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar");
    }
  };

  // ======================
  // ACTIVAR / DESACTIVAR
  // ======================
  const toggleActivo = async (row) => {
    try {
      await axios.put(`${API_URL}/api/recordatorios/${row.id}/${row.activo ? "desactivar" : "activar"}`);
      cargarRecordatorios();
    } catch (err) {
      console.error(err);
      alert("Error al actualizar estado");
    }
  };

  // ======================
  // COLUMNAS
  // ======================
  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    {
      field: "paciente",
      headerName: "Paciente",
      width: 200,
      renderCell: (params) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar sx={{ bgcolor: "#0284c7" }}>
            {params.row.paciente[0].toUpperCase()}
          </Avatar>
          {params.row.paciente}
        </div>
      ),
    },
    { field: "medicina", headerName: "Medicina", width: 160 },
    { field: "dosis", headerName: "Dosis", width: 140 },
    { field: "fecha", headerName: "Fecha", width: 120 },
    { field: "hora", headerName: "Hora", width: 120 },
    {
      field: "estado",
      headerName: "Estado",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.row.activo ? "Activo" : "Desactivado"}
          sx={{
            bgcolor: params.row.activo ? "#dcfce7" : "#fee2e2",
            color: params.row.activo ? "#065f46" : "#7f1d1d",
          }}
        />
      ),
    },
    {
      field: "editar",
      headerName: "Editar",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          sx={{ backgroundColor: "#0284c7" }}
          onClick={() => {
            setEditMode(true);
            setForm({ ...params.row });
            setOpenModal(true);
          }}
        >
          Editar
        </Button>
      ),
    },
    {
      field: "eliminar",
      headerName: "Eliminar",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="error"
          onClick={() => eliminar(params.row.id)}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h2>Gestión de Recordatorios</h2>
            <p style={{ color: "#64748b" }}>
              Administra recordatorios enviados a pacientes.
            </p>
          </div>

          <Button variant="contained" sx={{ backgroundColor: "#0284c7" }} onClick={() => {
              setEditMode(false);
              setForm({ id: null, usuarioId: "", medicina: "", dosis: "", fecha: "", hora: "" });
              setOpenModal(true);
            }}>
            Crear Recordatorio
          </Button>
        </div>

        <TextField
          fullWidth
          placeholder="Buscar por paciente, medicina o dosis"
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
          sx={{ mb: 2 }}
        />

        <div style={{ height: 520, width: "100%" }}>
          <DataGrid rows={filtrados} columns={columns} pageSize={5} />
        </div>
      </Paper>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: "#0284c7", color: "white" }}>
          {editMode ? "Editar Recordatorio" : "Crear Recordatorio"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            {/* Paciente */}
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Paciente"
                value={form.usuarioId}
                onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}
              >
                {usuarios.map((u) => (
                  <MenuItem value={u.id} key={u.id}>
                    {u.nombre}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Medicina */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medicina"
                value={form.medicina}
                onChange={(e) => setForm({ ...form, medicina: e.target.value })}
              />
            </Grid>

            {/* Dosis */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dosis"
                value={form.dosis}
                onChange={(e) => setForm({ ...form, dosis: e.target.value })}
              />
            </Grid>

            {/* Fecha */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              />
            </Grid>

            {/* Hora */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button onClick={guardar} variant="contained" sx={{ backgroundColor: "#0284c7" }}>
            {editMode ? "Guardar Cambios" : "Crear"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
