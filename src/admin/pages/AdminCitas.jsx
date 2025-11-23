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

  // 🔹 Cargar citas (todas)
  const cargarCitas = () => {
    axios
      .get("http://localhost:8080/api/citas")
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
      .catch((err) => console.log(err));
  };

  // 🔹 Cargar usuarios para el combo (paciente)
  const cargarUsuarios = () => {
    axios
      .get("http://localhost:8080/api/usuarios")
      .then((res) => {
        setUsuarios(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    cargarCitas();
    cargarUsuarios();
  }, []);

  // 🔍 Filtrar citas por médico, paciente, motivo
  useEffect(() => {
    const filtradas = citas.filter(
      (c) =>
        c.medico.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.motivo.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.paciente.toLowerCase().includes(busqueda.toLowerCase())
    );
    setCitasFiltradas(filtradas);
  }, [busqueda, citas]);

  // Columnas de la tabla
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
          <Avatar sx={{ bgcolor: '#0ea5e9', width: 28, height: 28 }}>{(params.row.paciente || 'P').charAt(0).toUpperCase()}</Avatar>
          <span style={{ color: '#0f172a', fontWeight: 500 }}>{params.row.paciente}</span>
        </div>
      ),
    },
    { field: "medico", headerName: "Médico", width: 220 },
    {
      field: "motivo",
      headerName: "Motivo",
      width: 220,
      renderCell: (params) => (
        <Chip size="small" label={params.row.motivo} sx={{ bgcolor: '#f0f9ff', color: '#0f172a', fontWeight: 500 }} />
      ),
    },
    {
      field: "editar",
      headerName: "Editar",
      width: 120,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => abrirEditar(params.row)} sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}>
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

  // 🟢 Abrir modal para crear
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

  // 🟠 Abrir modal para editar
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

  // 💾 Guardar (crear o actualizar)
  const guardarCita = () => {
    const body = {
      usuarioId: citaActual.usuarioId,
      fecha: citaActual.fecha,
      hora: citaActual.hora,
      medico: citaActual.medico,
      motivo: citaActual.motivo,
    };

    if (!citaActual.usuarioId) {
      alert("Debes seleccionar un paciente (usuario).");
      return;
    }

    if (!citaActual.fecha || !citaActual.hora || !citaActual.medico) {
      alert("Fecha, hora y médico son obligatorios.");
      return;
    }

    if (editMode) {
      // 🔁 ACTUALIZAR
      axios
        .put(`http://localhost:8080/api/citas/${citaActual.id}`, body)
        .then(() => {
          setOpenModal(false);
          cargarCitas();
        })
        .catch((err) => {
          console.error(err);
          alert("Error al actualizar la cita");
        });
    } else {
      // ➕ CREAR
      axios
        .post("http://localhost:8080/api/citas/crear", body)
        .then(() => {
          setOpenModal(false);
          cargarCitas();
        })
        .catch((err) => {
          console.error(err);
          alert("Error al crear la cita");
        });
    }
  };

  // 🗑 Eliminar cita
  const eliminarCita = (id) => {
    if (confirm("¿Seguro que deseas eliminar esta cita?")) {
      axios
        .delete(`http://localhost:8080/api/citas/${id}`)
        .then(() => cargarCitas())
        .catch((err) => {
          console.error(err);
          alert("Error al eliminar la cita");
        });
    }
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#0ea5e9' }}>Gestión de Citas</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Administra todas las citas registradas en el sistema.</p>
          </div>

          {/* BOTÓN CREAR */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
            onClick={abrirCrear}
          >
            Agregar Cita
          </Button>
        </div>

        {/* BUSCADOR */}
        <TextField
          label="Buscar por paciente, médico o motivo..."
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          fullWidth
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
        />

        {/* TABLA */}
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
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: { xs: '95vw', sm: '900px', md: '1040px' }
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: "#0284c7", color: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, py: 3 }}>
          {editMode ? "Editar Cita" : "Agregar Cita"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2, maxHeight: "80vh", overflowY: "auto", px: 4,
          '& .MuiFormLabel-root': { display: 'none' },
          '& .MuiOutlinedInput-notchedOutline legend': { display: 'none' }
        }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Paciente</div>
              <TextField
                select
                label=""
                value={citaActual.usuarioId || ""}
                onChange={(e) => setCitaActual({ ...citaActual, usuarioId: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              >
                {usuarios.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nombre} ({u.correo})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Médico</div>
              <TextField
                select
                label=""
                value={citaActual.medico}
                onChange={(e) => setCitaActual({ ...citaActual, medico: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><LocalHospitalIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              >
                <MenuItem value="Dr. Luis Paredes">Dr. Luis Paredes</MenuItem>
                <MenuItem value="Dra. Andrea Ríos">Dra. Andrea Ríos</MenuItem>
                <MenuItem value="Dr. Julio Medina">Dr. Julio Medina</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Fecha</div>
              <TextField
                label=""
                type="date"
                value={citaActual.fecha}
                onChange={(e) => setCitaActual({ ...citaActual, fecha: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Hora</div>
              <TextField
                label=""
                type="time"
                value={citaActual.hora}
                onChange={(e) => setCitaActual({ ...citaActual, hora: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Motivo</div>
              <TextField
                label=""
                value={citaActual.motivo}
                onChange={(e) => setCitaActual({ ...citaActual, motivo: e.target.value })}
                fullWidth
                multiline
                minRows={3}
                InputProps={{ startAdornment: <InputAdornment position="start"><DescriptionIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 3 }}>
          <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ borderColor: "#94a3b8", color: "#0f172a" }}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCita} sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" } }}>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}