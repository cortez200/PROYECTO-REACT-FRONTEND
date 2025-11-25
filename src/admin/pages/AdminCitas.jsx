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
  Avatar,
  Chip,
  InputAdornment,
  Grid,
  Divider,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DescriptionIcon from "@mui/icons-material/Description";
import axios from "axios";

export default function AdminCitas() {
  const [citas, setCitas] = useState([]);
  const [citasFiltradas, setCitasFiltradas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [citaActual, setCitaActual] = useState({
    id: null,
    fecha: "",
    hora: "",
    medico: "",
    motivo: "",
    usuarioId: "",
  });

  // ✔ API base desde .env
  const API_URL = import.meta.env.VITE_API_URL;

  // 🔹 Cargar citas
  const cargarCitas = () => {
    axios
      .get(`${API_URL}/api/citas`)
      .then((res) => {
        const data = res.data.map((c) => ({
          id: c.id,
          fecha: c.fecha,
          hora: c.hora,
          medico: c.medico,
          motivo: c.motivo,
          usuarioId: c.usuario ? c.usuario.id : null,
          paciente: c.usuario ? c.usuario.nombre : "Sin asignar",
        }));
        setCitas(data);
      })
      .catch((err) => console.log("Error cargando citas:", err));
  };

  // 🔹 Cargar usuarios (pacientes)
  const cargarUsuarios = () => {
    axios
      .get(`${API_URL}/api/usuarios`)
      .then((res) => {
        setUsuarios(res.data);
      })
      .catch((err) => console.log("Error cargando usuarios:", err));
  };

  useEffect(() => {
    cargarCitas();
    cargarUsuarios();
  }, []);

  // 🔍 Filtrar citas
  useEffect(() => {
    const filtradas = citas.filter(
      (c) =>
        c.medico.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.paciente.toLowerCase().includes(busqueda.toLowerCase())
    );
    setCitasFiltradas(filtradas);
  }, [busqueda, citas]);

  // Columnas de tabla
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "fecha", headerName: "Fecha", width: 130 },
    { field: "hora", headerName: "Hora", width: 120 },
    {
      field: "paciente",
      headerName: "Paciente",
      width: 240,
      renderCell: (params) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Avatar sx={{ bgcolor: '#0ea5e9', width: 28, height: 28 }}>
            {(params.row.paciente || 'P').charAt(0).toUpperCase()}
          </Avatar>
          <span style={{ color: '#0f172a', fontWeight: 500 }}>
            {params.row.paciente}
          </span>
        </div>
      ),
    },
    { field: "medico", headerName: "Médico", width: 220 },
    {
      field: "motivo",
      headerName: "Motivo",
      width: 220,
      renderCell: (params) => (
        <Chip 
          size="small" 
          label={params.row.motivo} 
          sx={{ bgcolor: '#f0f9ff', color: '#0f172a', fontWeight: 500 }} 
        />
      ),
    },
    {
      field: "editar",
      headerName: "Editar",
      width: 120,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          onClick={() => abrirEditar(params.row)} 
          sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
        >
          Editar
        </Button>
      ),
    },
    {
      field: "eliminar",
      headerName: "Eliminar",
      width: 120,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => eliminarCita(params.row.id)}
          sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  // 🟢 Crear cita
  const abrirCrear = () => {
    setEditMode(false);
    setCitaActual({
      id: null,
      fecha: "",
      hora: "",
      medico: "",
      motivo: "",
      usuarioId: "",
    });
    setOpenModal(true);
  };

  // 🟠 Editar cita
  const abrirEditar = (cita) => {
    setEditMode(true);
    setCitaActual({
      id: cita.id,
      fecha: cita.fecha,
      hora: cita.hora,
      medico: cita.medico,
      motivo: cita.motivo,
      usuarioId: cita.usuarioId,
    });
    setOpenModal(true);
  };

  // 💾 Guardar cambios
  const guardarCita = () => {
    const body = {
      usuarioId: citaActual.usuarioId,
      fecha: citaActual.fecha,
      hora: citaActual.hora,
      medico: citaActual.medico,
      motivo: citaActual.motivo,
    };

    if (editMode) {
      axios
        .put(`${API_URL}/api/citas/${citaActual.id}`, body)
        .then(() => {
          setOpenModal(false);
          cargarCitas();
        })
        .catch(() => alert("Error al actualizar cita"));
    } else {
      axios
        .post(`${API_URL}/api/citas/crear`, body)
        .then(() => {
          setOpenModal(false);
          cargarCitas();
        })
        .catch(() => alert("Error al crear cita"));
    }
  };

  // 🗑 Eliminar
  const eliminarCita = (id) => {
    if (confirm("¿Seguro de eliminar la cita?")) {
      axios
        .delete(`${API_URL}/api/citas/${id}`)
        .then(() => cargarCitas())
        .catch(() => alert("Error eliminando cita"));
    }
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#0ea5e9' }}>Gestión de Citas</h2>
            <p style={{ margin: 0, color: '#64748b' }}>
              Administra todas las citas registradas en el sistema.
            </p>
          </div>

          <Button
            variant="contained"
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
            onClick={abrirCrear}
          >
            Agregar Cita
          </Button>
        </div>

        <TextField
          label="Buscar por paciente, médico o motivo..."
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          fullWidth
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
        />

        <div style={{ height: 500, width: "100%" }}>
          <DataGrid rows={citasFiltradas} columns={columns} pageSize={5} sx={{
            border: '1px solid #e5e7eb',
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f0f9ff', color: '#0f172a' },
            '& .MuiDataGrid-cell': { borderColor: '#e5e7eb' },
            '& .MuiDataGrid-footerContainer': { backgroundColor: '#f8fafc' }
          }} />
        </div>
      </Paper>
      

      {/* MODAL */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle sx={{ bgcolor: "#0284c7", color: "#fff" }}>
          {editMode ? "Editar Cita" : "Agregar Cita"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Paciente"
                value={citaActual.usuarioId}
                onChange={(e) => setCitaActual({ ...citaActual, usuarioId: e.target.value })}
              >
                {usuarios.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre} ({u.correo})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Médico"
                value={citaActual.medico}
                onChange={(e) => setCitaActual({ ...citaActual, medico: e.target.value })}
              >
                <MenuItem value="Dr. Luis Paredes">Dr. Luis Paredes</MenuItem>
                <MenuItem value="Dra. Andrea Ríos">Dra. Andrea Ríos</MenuItem>
                <MenuItem value="Dr. Julio Medina">Dr. Julio Medina</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Fecha"
                type="date"
                fullWidth
                value={citaActual.fecha}
                onChange={(e) => setCitaActual({ ...citaActual, fecha: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Hora"
                type="time"
                fullWidth
                value={citaActual.hora}
                onChange={(e) => setCitaActual({ ...citaActual, hora: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Motivo"
                fullWidth
                multiline
                rows={3}
                value={citaActual.motivo}
                onChange={(e) => setCitaActual({ ...citaActual, motivo: e.target.value })}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)} variant="outlined">
            Cancelar
          </Button>
          <Button onClick={guardarCita} variant="contained" sx={{ bgcolor: "#0284c7" }}>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
