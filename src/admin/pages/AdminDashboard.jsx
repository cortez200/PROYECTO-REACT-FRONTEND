import * as React from 'react';
import AdminLayout from '../layout/AdminLayout';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { MiniBarChart, MiniLineChart, DonutChart } from '../components/Charts';

export default function AdminDashboard() {
  const [usuarios, setUsuarios] = React.useState([]);
  const [citas, setCitas] = React.useState([]);
  const [recordatorios, setRecordatorios] = React.useState([]);

  // ✔ Usamos el backend en producción desde .env
  const API_URL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    const load = async () => {
      try {
        const [u, c, r] = await Promise.all([
          axios.get(`${API_URL}/api/usuarios`),
          axios.get(`${API_URL}/api/citas`),
          axios.get(`${API_URL}/api/recordatorios`),
        ]);

        setUsuarios(u.data || []);
        setCitas(c.data || []);
        setRecordatorios(r.data || []);

      } catch (error) {
        console.error("Error cargando información del dashboard:", error);
        setUsuarios([]);
        setCitas([]);
        setRecordatorios([]);
      }
    };

    load();
  }, [API_URL]);

  // ==== RESÚMENES ====
  const hoyStr = new Date().toISOString().slice(0, 10);

  const totalPacientes = usuarios.filter(x => x.tipo === 'PACIENTE').length;
  const citasHoy = citas.filter(x => (x.fecha || '').toString().startsWith(hoyStr)).length;

  const tomados = recordatorios.filter(r => r.tomado).length;
  const totalRec = recordatorios.length;

  // Últimos 7 días de citas
  const ult7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const s = d.toISOString().slice(0, 10);
    return citas.filter(x => (x.fecha || '').toString().startsWith(s)).length;
  });

  return (
    <AdminLayout>
      <Grid container spacing={3}>
        
        {/* Total Pacientes */}
        <Grid item xs={12} md={4}>
          <Paper className="admin-card" sx={{ p: 2.5 }} elevation={0}>
            <h3 className="admin-section-title">Total Pacientes</h3>
            <p style={{ fontSize: 28, margin: '6px 0', color: '#0f172a' }}>{totalPacientes}</p>
            <MiniLineChart data={ult7} />
          </Paper>
        </Grid>

        {/* Citas hoy */}
        <Grid item xs={12} md={4}>
          <Paper className="admin-card" sx={{ p: 2.5 }} elevation={0}>
            <h3 className="admin-section-title">Citas Hoy</h3>
            <p style={{ fontSize: 28, margin: '6px 0', color: '#0f172a' }}>{citasHoy}</p>
            <MiniBarChart data={ult7} />
          </Paper>
        </Grid>

        {/* Recordatorios */}
        <Grid item xs={12} md={4}>
          <Paper className="admin-card" sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }} elevation={0}>
            <div>
              <h3 className="admin-section-title">Medicaciones tomadas</h3>
              <p style={{ fontSize: 28, margin: '6px 0', color: '#0f172a' }}>{tomados}</p>
              <p style={{ margin: 0, color: '#64748b' }}>de {totalRec} recordatorios</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <DonutChart value={tomados} total={totalRec || 1} />
            </div>
          </Paper>
        </Grid>

      </Grid>
    </AdminLayout>
  );
}
