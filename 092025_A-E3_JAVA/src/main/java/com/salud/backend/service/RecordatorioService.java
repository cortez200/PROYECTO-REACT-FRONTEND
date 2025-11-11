package com.salud.backend.service;

import com.salud.backend.model.Recordatorio;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.RecordatorioRepository;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RecordatorioService {

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ Crear recordatorio
    public Recordatorio crearRecordatorio(Long usuarioId, String descripcion, LocalDateTime fechaHora) {
        Usuario u = usuarioRepository.findById(usuarioId).orElse(null);
        if (u == null) return null;

        Recordatorio r = new Recordatorio();
        r.setUsuario(u);
        r.setDescripcion(descripcion);
        r.setFechaHora(fechaHora);
        r.setTomado(false);
        return recordatorioRepository.save(r);
    }

    // ✅ Listar recordatorios de un usuario
    public List<Recordatorio> listarPorUsuario(Long usuarioId) {
        // 🔹 usamos el método correcto con "_"
        return recordatorioRepository.findByUsuario_IdOrderByFechaHoraAsc(usuarioId);
    }

    // ✅ Eliminar recordatorio
    public boolean eliminar(Long id) {
        if (!recordatorioRepository.existsById(id)) return false;
        recordatorioRepository.deleteById(id);
        return true;
    }

    // ✅ Obtener recordatorios pendientes
    public List<Recordatorio> pendientes() {
        return recordatorioRepository.findByTomadoFalse();
    }
}
