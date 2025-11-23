import React, { useEffect, useState } from "react";
import AdminLayout from "../layout/AdminLayout";
import { DataGrid } from "@mui/x-data-grid";
import {
  Button, Paper, Dialog, DialogActions, DialogContent,
  DialogTitle, TextField, MenuItem, Chip, Avatar, InputAdornment,
  Grid, Divider, Typography
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import axios from "axios";

export default function AdminPacientes() {

  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);

  const [busqueda, setBusqueda] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [usuarioActual, setUsuarioActual] = useState({
    id: null,
    nombre: "",
    correo: "",
    password: "",
    tipo: "PACIENTE"
  });

  // Cargar usuarios del backend
  const cargarUsuarios = () => {
    axios.get("http://localhost:8080/api/usuarios")
      .then((res) => {
        const data = res.data.map(u => ({
          id: u.id,
          nombre: u.nombre,
          correo: u.correo,
          password: u.password,
          tipo: u.tipo
        }));
        setUsuarios(data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // 🔍 FILTRAR USUARIOS POR NOMBRE / CORREO / TIPO
  useEffect(() => {
    const filtrados = usuarios.filter((u) =>
      u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.correo.toLowerCase().includes(busqueda.toLowerCase()) ||
      u.tipo.toLowerCase().includes(busqueda.toLowerCase())
    );
    setUsuariosFiltrados(filtrados);
  }, [busqueda, usuarios]);

  // Columnas de DataGrid
  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "nombre", headerName: "Nombre", width: 240, renderCell: (params) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar sx={{ bgcolor: '#0284c7', width: 28, height: 28 }}>{(params.row.nombre || 'P').charAt(0).toUpperCase()}</Avatar>
        <span style={{ color: '#0f172a', fontWeight: 500 }}>{params.row.nombre}</span>
      </div>
    ) },
    { field: "correo", headerName: "Correo", width: 260 },
    { field: "tipo", headerName: "Tipo", width: 140, renderCell: (params) => (
      <Chip size="small" label={params.row.tipo} sx={{
        bgcolor: params.row.tipo === 'ADMIN' ? '#dbeafe' : '#dcfce7',
        color: params.row.tipo === 'ADMIN' ? '#1e3a8a' : '#065f46',
        fontWeight: 600
      }} />
    ) },

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
          onClick={() => eliminarUsuario(params.row.id)}
          sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  // Abrir modal vacío (crear)
  const abrirCrear = () => {
    setEditMode(false);
    setUsuarioActual({
      id: null,
      nombre: "",
      correo: "",
      password: "",
      tipo: "PACIENTE"
    });
    setOpenModal(true);
  };

  // Abrir modal con datos (editar)
  const abrirEditar = (usuario) => {
    setEditMode(true);
    setUsuarioActual(usuario);
    setOpenModal(true);
  };

  // Guardar o actualizar usuario
  const guardarUsuario = () => {
    if (editMode) {
      axios.put(`http://localhost:8080/api/usuarios/${usuarioActual.id}`, usuarioActual)
        .then(() => {
          setOpenModal(false);
          cargarUsuarios();
        });
    } else {
      axios.post("http://localhost:8080/api/usuarios", usuarioActual)
        .then(() => {
          setOpenModal(false);
          cargarUsuarios();
        });
    }
  };

  // Eliminar usuario
  const eliminarUsuario = (id) => {
    if (confirm("¿Seguro que deseas eliminar este usuario?")) {
      axios.delete(`http://localhost:8080/api/usuarios/${id}`)
        .then(() => cargarUsuarios());
    }
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#0ea5e9' }}>Gestión de Usuarios</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Administra los usuarios registrados.</p>
          </div>

          {/* BOTÓN CREAR */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}
            onClick={abrirCrear}
          >
            Agregar Usuario
          </Button>
        </div>

        {/* 🔍 BUSCADOR */}
        <TextField
          label="Buscar usuario..."
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          fullWidth
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start">🔎</InputAdornment>
          }}
        />

        {/* TABLA */}
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid 
            rows={usuariosFiltrados}
            columns={columns}
            pageSize={5}
            sx={{
              border: '1px solid #e5e7eb',
              '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f0f9ff', color: '#0f172a' },
              '& .MuiDataGrid-cell': { borderColor: '#e5e7eb' },
              '& .MuiDataGrid-footerContainer': { backgroundColor: '#f8fafc' }
            }}
          />
        </div>
      </Paper>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ bgcolor: "#0284c7", color: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", alignItems: "center", gap: 1 }}>
          <AdminPanelSettingsIcon /> {editMode ? "Editar Usuario" : "Agregar Usuario"}
        </DialogTitle>

        <DialogContent sx={{ mt: 2, maxHeight: "70vh", overflowY: "auto", px: 3 }}>
          <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
            Completa los datos del usuario. Todos los campos son obligatorios.
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nombre"
                required
                value={usuarioActual.nombre}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, nombre: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Correo"
                type="email"
                required
                value={usuarioActual.correo}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, correo: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Contraseña"
                type="password"
                required
                value={usuarioActual.password}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, password: e.target.value })}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                label="Tipo de Usuario"
                required
                value={usuarioActual.tipo}
                onChange={(e) => setUsuarioActual({ ...usuarioActual, tipo: e.target.value })}
                fullWidth
              >
                <MenuItem value="PACIENTE">PACIENTE</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </TextField>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ borderColor: "#94a3b8", color: "#0f172a" }}>Cancelar</Button>
          <Button variant="contained" onClick={guardarUsuario} sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" } }}>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
