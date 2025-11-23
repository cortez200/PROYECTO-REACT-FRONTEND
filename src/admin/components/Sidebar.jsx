import * as React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import AlarmIcon from '@mui/icons-material/Alarm';
import DescriptionIcon from '@mui/icons-material/Description';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          boxShadow: '0 4px 20px rgba(2, 132, 199, 0.06)',
        },
      }}
    >
      <List sx={{ p: 1,
        '& .MuiListItemButton-root': {
          borderRadius: 10,
          mb: 0.5,
          '&:hover': { backgroundColor: '#f0f9ff' },
        },
        '& .Mui-selected': {
          backgroundColor: '#e0f2fe',
          '& .MuiListItemIcon-root': { color: '#0284c7' },
        },
        '& .MuiListItemIcon-root': { color: '#64748b' }
      }}>

        <ListItemButton component={Link} to="/admin" selected={pathname === '/admin'}>
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>

        <ListItemButton component={Link} to="/admin/pacientes" selected={pathname.startsWith('/admin/pacientes')}>
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          <ListItemText primary="Pacientes" />
        </ListItemButton>

        <ListItemButton component={Link} to="/admin/citas" selected={pathname.startsWith('/admin/citas')}>
          <ListItemIcon><EventIcon /></ListItemIcon>
          <ListItemText primary="Citas" />
        </ListItemButton>

        <ListItemButton component={Link} to="/admin/recordatorios" selected={pathname.startsWith('/admin/recordatorios')}>
          <ListItemIcon><AlarmIcon /></ListItemIcon>
          <ListItemText primary="Recordatorios" />
        </ListItemButton>

        <ListItemButton component={Link} to="/admin/historial" selected={pathname.startsWith('/admin/historial')}>
          <ListItemIcon><DescriptionIcon /></ListItemIcon>
          <ListItemText primary="Historial Médico" />
        </ListItemButton>


      </List>
    </Drawer>
  );
}