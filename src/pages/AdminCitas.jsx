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
} from "@mui/material";
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
    { field: "id", headerName: "ID", width: 70 },
    { field: "fecha", headerName: "Fecha", width: 120 },
    { field: "hora", headerName: "Hora", width: 120 },
    { field: "paciente", headerName: "Paciente", width: 200 },
    { field: "medico", headerName: "Médico", width: 180 },
    { field: "motivo", headerName: "Motivo", width: 220 },
    {
      field: "editar",
      headerName: "Editar",
      width: 120,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => abrirEditar(params.row)}>
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
          color="error"
          onClick={() => eliminarCita(params.row.id)}
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
      <Paper sx={{ p: 2 }}>
        <h2>Gestión de Citas</h2>
        <p>Administra todas las citas registradas en el sistema.</p>

        {/* BOTÓN CREAR */}
        <Button
          variant="contained"
          color="primary"
          sx={{ mb: 2 }}
          onClick={abrirCrear}
        >
          Agregar Cita
        </Button>

        {/* BUSCADOR */}
        <TextField
          label="Buscar por paciente, médico o motivo..."
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
          fullWidth
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {/* TABLA */}
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid rows={citasFiltradas} columns={columns} pageSize={5} />
        </div>
      </Paper>

      {/* MODAL */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          {editMode ? "Editar Cita" : "Agregar Cita"}
        </DialogTitle>

        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Paciente (Usuario)"
            value={citaActual.usuarioId || ""}
            onChange={(e) =>
              setCitaActual({ ...citaActual, usuarioId: e.target.value })
            }
            fullWidth
          >
            {usuarios.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.nombre} ({u.correo})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Fecha"
            type="date"
            value={citaActual.fecha}
            onChange={(e) =>
              setCitaActual({ ...citaActual, fecha: e.target.value })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Hora"
            type="time"
            value={citaActual.hora}
            onChange={(e) =>
              setCitaActual({ ...citaActual, hora: e.target.value })
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Médico"
            value={citaActual.medico}
            onChange={(e) =>
              setCitaActual({ ...citaActual, medico: e.target.value })
            }
            fullWidth
          />

          <TextField
            label="Motivo"
            value={citaActual.motivo}
            onChange={(e) =>
              setCitaActual({ ...citaActual, motivo: e.target.value })
            }
            fullWidth
            multiline
            rows={3}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
          <Button variant="contained" onClick={guardarCita}>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
