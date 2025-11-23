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
  const [recordatorios, setRecordatorios] = useState([]);
  const [filtrados, setFiltrados] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState(null);

  const [form, setForm] = useState({
    id: null,
    usuarioId: "",
    medicina: "",
    dosis: "",
    fecha: "",
    hora: "",
    activo: true,
  });

  const cargarRecordatorios = () => {
    const mapRow = (r, userMap) => {
      const desc = r.descripcion || "";
      const parts = desc.split("—").map((s) => s.trim());
      const medicina = parts[0] || desc;
      const dosis = parts[1] || "";
      const fechaHora = r.fechaHora || "";
      const [fecha, horaFull] = fechaHora.split("T");
      const hora = (horaFull || "").substring(0, 5);

      const usuarioObj = r.usuario || (userMap && userMap[r.usuarioId]);
      const paciente = usuarioObj ? usuarioObj.nombre : "Sin asignar";
      const usuarioId = usuarioObj ? usuarioObj.id : (r.usuarioId || null);

      return {
        id: r.id,
        usuarioId,
        paciente,
        medicina,
        dosis,
        fecha: fecha || "",
        hora: hora || "",
        activo: r.activo !== undefined ? r.activo : true,
        tomado: r.tomado || false,
      };
    };

    const fallbackPorUsuario = async () => {
      try {
        // Asegurar usuarios cargados
        let users = usuarios;
        if (!users || users.length === 0) {
          const resUsers = await axios.get("http://localhost:8080/api/usuarios");
          users = resUsers.data || [];
          setUsuarios(users);
        }
        const userMap = (users || []).reduce((acc, u) => {
          acc[u.id] = u;
          return acc;
        }, {});

        const todas = [];
        for (const u of users) {
          try {
            const { data } = await axios.get(
              `http://localhost:8080/api/recordatorios/usuario/${u.id}`
            );
            (data || []).forEach((r) => todas.push(mapRow(r, userMap)));
          } catch (_) {
            // Ignorar errores por usuario individual para no romper el agregado
          }
        }
        setRecordatorios(todas);
      } catch (e) {
        console.error(e);
      }
    };

    axios
      .get("http://localhost:8080/api/recordatorios")
      .then((res) => {
        const data = (res.data || []).map((r) => mapRow(r));
        setRecordatorios(data);
      })
      .catch(async (err) => {
        // Si el backend en ejecución no soporta el GET global (HTTP 405), usar fallback
        if (err?.response?.status === 405) {
          await fallbackPorUsuario();
          return;
        }
        console.error(err);
      });
  };

  const cargarUsuarios = () => {
    axios
      .get("http://localhost:8080/api/usuarios")
      .then((res) => setUsuarios(res.data || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    cargarRecordatorios();
    cargarUsuarios();
    const timer = setInterval(() => cargarRecordatorios(), 5000);
    setRefreshTimer(timer);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = busqueda.toLowerCase();
    const f = recordatorios.filter(
      (r) =>
        (r.paciente || "").toLowerCase().includes(q) ||
        (r.medicina || "").toLowerCase().includes(q) ||
        (r.dosis || "").toLowerCase().includes(q)
    );
    setFiltrados(f);
  }, [busqueda, recordatorios]);

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
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
    { field: "medicina", headerName: "Medicina", width: 180, renderCell: (p) => (<Chip size="small" label={p.row.medicina} sx={{ bgcolor: '#f0f9ff', color: '#0f172a' }} />) },
    { field: "dosis", headerName: "Dosis", width: 140 },
    { field: "fecha", headerName: "Fecha", width: 120 },
    { field: "hora", headerName: "Hora", width: 110 },
    {
      field: "estado",
      headerName: "Estado",
      width: 140,
      renderCell: (params) => (
        <Chip size="small" label={params.row.activo ? 'Activo' : 'Desactivado'} sx={{
          bgcolor: params.row.activo ? '#dcfce7' : '#fee2e2',
          color: params.row.activo ? '#065f46' : '#7f1d1d',
          fontWeight: 600
        }} />
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
      field: "toggle",
      headerName: "Desactivar",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="contained"
          onClick={() => toggleActivo(params.row)}
          sx={{ backgroundColor: params.row.activo ? '#f59e0b' : '#10b981', '&:hover': { backgroundColor: params.row.activo ? '#d97706' : '#059669' } }}
        >
          {params.row.activo ? "Desactivar" : "Activar"}
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
          onClick={() => eliminar(params.row.id)}
          sx={{ backgroundColor: '#ef4444', '&:hover': { backgroundColor: '#dc2626' } }}
        >
          Eliminar
        </Button>
      ),
    },
  ];

  // Error boundary para evitar pantalla en blanco si DataGrid falla
  class ErrorBoundary extends React.Component {
    constructor(props) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error, info) {
      console.error("DataGrid render error:", error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div>
            <p style={{ marginBottom: 8 }}>
              Ocurrió un problema al mostrar la grilla. Mostramos una tabla simple.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-2 border">ID</th>
                  <th className="p-2 border">Paciente</th>
                  <th className="p-2 border">Medicina</th>
                  <th className="p-2 border">Dosis</th>
                  <th className="p-2 border">Fecha</th>
                  <th className="p-2 border">Hora</th>
                  <th className="p-2 border">Estado</th>
                  <th className="p-2 border">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r) => (
                  <tr key={r.id}>
                    <td className="p-2 border">{r.id}</td>
                    <td className="p-2 border">{r.paciente}</td>
                    <td className="p-2 border">{r.medicina}</td>
                    <td className="p-2 border">{r.dosis}</td>
                    <td className="p-2 border">{r.fecha}</td>
                    <td className="p-2 border">{r.hora}</td>
                    <td className="p-2 border">{r.activo ? "Activo" : "Desactivado"}</td>
                    <td className="p-2 border">
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => abrirEditar(r)}>Editar</Button>
                        <Button size="small" variant="contained" color={r.activo ? "warning" : "success"} onClick={() => toggleActivo(r)}>
                          {r.activo ? "Desactivar" : "Activar"}
                        </Button>
                        <Button size="small" variant="contained" color="error" onClick={() => eliminar(r.id)}>Eliminar</Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return this.props.children;
    }
  }

  const abrirCrear = () => {
    setEditMode(false);
    setForm({ id: null, usuarioId: "", medicina: "", dosis: "", fecha: "", hora: "", activo: true });
    setOpenModal(true);
  };

  const abrirEditar = (row) => {
    setEditMode(true);
    setForm({
      id: row.id,
      usuarioId: row.usuarioId || "",
      medicina: row.medicina || "",
      dosis: row.dosis || "",
      fecha: row.fecha || "",
      hora: row.hora || "",
      activo: row.activo,
    });
    setOpenModal(true);
  };

  const guardar = async () => {
    if (!form.usuarioId || !form.medicina || !form.dosis || !form.fecha || !form.hora) {
      alert("Completa paciente, medicina, dosis, fecha y hora.");
      return;
    }

    const descripcion = `${form.medicina} — ${form.dosis}`;
    const normalizarFecha = (f) => {
      // Acepta 'YYYY-MM-DD' o 'DD/MM/YYYY' y devuelve 'YYYY-MM-DD'
      if (!f) return f;
      if (f.includes('/')) {
        const [dd, mm, yyyy] = f.split('/');
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
      }
      return f;
    };
    const fechaHora = `${normalizarFecha(form.fecha)}T${form.hora}:00`;
    const body = { usuarioId: form.usuarioId, descripcion, fechaHora };

    if (editMode && form.id) {
      console.log("PUT /api/recordatorios payload:", body);
      try {
        await axios.put(`http://localhost:8080/api/recordatorios/${form.id}`, body);
        setOpenModal(false);
        cargarRecordatorios();
        return;
      } catch (err) {
        console.error("Error actualizando recordatorio", err);
        const data = err?.response?.data;
        const status = err?.response?.status;
        const originalMsg = typeof data === "string"
          ? data
          : (data && typeof data === "object")
            ? (data.mensaje || data.error || JSON.stringify(data))
            : (status ? `Error (${status}) al actualizar el recordatorio` : "Error al actualizar el recordatorio");

        // 1) Fallback: si el backend no permite PUT (405), usar POST /{id}/actualizar
        if (status === 405) {
          console.warn("PUT 405 — aplicando fallback POST /{id}/actualizar");
          try {
            await axios.post(`http://localhost:8080/api/recordatorios/${form.id}/actualizar`, body);
            setOpenModal(false);
            cargarRecordatorios();
            return;
          } catch (e1) {
            console.error("Fallback POST actualizar también falló", e1);
            // 2) Fallback robusto: crear nuevo y eliminar el antiguo
            try {
              const createRes = await axios.post("http://localhost:8080/api/recordatorios", body);
              await axios.delete(`http://localhost:8080/api/recordatorios/${form.id}`);
              alert("El backend no permite PUT. Se recreó el recordatorio con un nuevo ID.");
              setOpenModal(false);
              cargarRecordatorios();
              return;
            } catch (e2) {
              const d2 = e2?.response?.data;
              const s2 = e2?.response?.status;
              const msg2 = typeof d2 === "string"
                ? d2
                : (d2 && typeof d2 === "object")
                  ? (d2.mensaje || d2.error || JSON.stringify(d2))
                  : (s2 ? `Error (${s2}) al recrear el recordatorio` : "Error al recrear el recordatorio");
              alert(msg2 || originalMsg);
              return;
            }
          }
        }

        // Otros errores (no 405)
        alert(originalMsg);
        return;
      }
    } else {
      try {
        await axios.post("http://localhost:8080/api/recordatorios", body);
        setOpenModal(false);
        cargarRecordatorios();
        return;
      } catch (err) {
        console.error(err);
        const d = err?.response?.data;
        const s = err?.response?.status;
        const msg = typeof d === "string"
          ? d
          : (d && typeof d === "object")
            ? (d.mensaje || d.error || JSON.stringify(d))
            : (s ? `Error (${s}) al crear el recordatorio` : "Error al crear el recordatorio");
        alert(msg);
        return;
      }
    }
  };

  const eliminar = (id) => {
    if (confirm("¿Seguro que deseas eliminar este recordatorio?")) {
      axios
        .delete(`http://localhost:8080/api/recordatorios/${id}`)
        .then(() => cargarRecordatorios())
        .catch((err) => {
          console.error(err);
          alert("Error al eliminar el recordatorio");
        });
    }
  };

  const toggleActivo = (row) => {
    const url = `http://localhost:8080/api/recordatorios/${row.id}/${row.activo ? "desactivar" : "activar"}`;
    axios
      .put(url)
      .then(() => cargarRecordatorios())
      .catch((err) => {
        console.error(err);
        alert("Error al actualizar estado");
      });
  };

  return (
    <AdminLayout>
      <Paper className="admin-card" sx={{ p: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ margin: 0, color: '#0ea5e9' }}>Gestión de Recordatorios</h2>
            <p style={{ margin: 0, color: '#64748b' }}>Administra recordatorios creados por usuarios o por el administrador.</p>
          </div>
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={abrirCrear} sx={{ backgroundColor: '#0284c7', '&:hover': { backgroundColor: '#0369a1' } }}>Crear Recordatorio</Button>
            <Button variant="outlined" onClick={cargarRecordatorios} sx={{ borderColor: '#94a3b8', color: '#0f172a' }}>Actualizar</Button>
          </Stack>
        </div>

        <TextField
          label="Buscar por paciente, medicina o dosis"
          variant="outlined"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start">🔎</InputAdornment> }}
        />

        <div style={{ height: 520, width: "100%" }}>
          <ErrorBoundary>
            <DataGrid
              rows={filtrados}
              columns={columns}
              disableRowSelectionOnClick
              pageSizeOptions={[5, 10, 20]}
              paginationModel={{ pageSize: 5, page: 0 }}
              sx={{
                border: '1px solid #e5e7eb',
                '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f0f9ff', color: '#0f172a' },
                '& .MuiDataGrid-cell': { borderColor: '#e5e7eb' },
                '& .MuiDataGrid-footerContainer': { backgroundColor: '#f8fafc' }
              }}
            />
          </ErrorBoundary>
        </div>
      </Paper>

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
        <DialogTitle sx={{ bgcolor: "#0284c7", color: "#fff", borderTopLeftRadius: 12, borderTopRightRadius: 12, py: 3 }}>{editMode ? "Editar Recordatorio" : "Crear Recordatorio"}</DialogTitle>
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
                value={form.usuarioId}
                onChange={(e) => setForm({ ...form, usuarioId: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              >
                {usuarios.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.nombre}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Medicina</div>
              <TextField
                label=""
                value={form.medicina}
                onChange={(e) => setForm({ ...form, medicina: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><MedicationIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Dosis</div>
              <TextField
                label=""
                value={form.dosis}
                onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><ListAltIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Fecha</div>
              <TextField
                label=""
                type="date"
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>Hora</div>
              <TextField
                label=""
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
                InputProps={{ startAdornment: <InputAdornment position="start"><AccessTimeIcon sx={{ color: "#64748b" }} /></InputAdornment> }}
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
        </DialogContent>
        <DialogActions sx={{ px: 4, py: 3 }}>
          <Button variant="outlined" onClick={() => setOpenModal(false)} sx={{ borderColor: "#94a3b8", color: "#0f172a" }}>Cancelar</Button>
          <Button variant="contained" onClick={guardar} sx={{ bgcolor: "#0284c7", "&:hover": { bgcolor: "#0369a1" } }}>{editMode ? "Actualizar" : "Guardar"}</Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}