import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

export default function AdminLayout({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <Topbar />

      <Sidebar />

      <Box
        component="main"
        className="admin-main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          p: 4,
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}