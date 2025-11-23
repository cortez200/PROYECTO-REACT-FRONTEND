import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const navigate = useNavigate();
  const user = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('adminUsuario')) || JSON.parse(localStorage.getItem('usuario')) || null;
    } catch (_) { return null; }
  }, []);

  const nombre = user?.nombre || 'Administrador';

  return (
    <AppBar position="absolute" elevation={1} sx={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
      <Toolbar sx={{ px: 3, minHeight: 64, position: 'relative' }}>
        <Typography
          variant="h6"
          noWrap
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontWeight: 700,
            color: '#0ea5e9',
          }}
        >
          Salud Digital — Panel Admin
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
          <Avatar sx={{ bgcolor: '#0284c7' }}>{(nombre || 'A').charAt(0).toUpperCase()}</Avatar>
          <Typography variant="body1" sx={{ color: '#334155', fontWeight: 500 }}>{nombre}</Typography>
          <Button size="small" variant="outlined" onClick={() => { localStorage.removeItem('adminUsuario'); navigate('/login'); }} sx={{ ml: 1, borderColor: '#e2e8f0', color: '#0f172a', '&:hover': { borderColor: '#94a3b8' } }}>
            Cerrar sesión
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}