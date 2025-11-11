package com.salud.backend.controller;

import com.salud.backend.model.Recordatorio;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.RecordatorioRepository;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = "http://localhost:5173")
public class RecordatorioController {

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // ✅ Crear un nuevo recordatorio
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> body) {
        try {
            Long usuarioId = Long.valueOf(body.get("usuarioId"));
            String descripcion = body.get("descripcion");
            String fechaHoraIso = body.get("fechaHora");

            Usuario u = usuarioRepository.findById(usuarioId).orElse(null);
            if (u == null)
                return ResponseEntity.badRequest().body("Usuario no encontrado");

            LocalDateTime fechaHora = LocalDateTime.parse(fechaHoraIso);

            Recordatorio r = new Recordatorio();
            r.setUsuario(u);
            r.setDescripcion(descripcion);
            r.setFechaHora(fechaHora);
            r.setTomado(false);
            r.setNotificado(false);
            r.setAlertaEnviada(false);
            r.setNotificadoAt(null);

            recordatorioRepository.save(r);
            return ResponseEntity.ok("✅ Recordatorio creado correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("❌ Error al crear recordatorio: " + e.getMessage());
        }
    }

    // ✅ Obtener todos los recordatorios de un usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Recordatorio>> listarPorUsuario(@PathVariable Long usuarioId) {
        List<Recordatorio> lista = recordatorioRepository.findByUsuario_IdOrderByFechaHoraAsc(usuarioId);
        return ResponseEntity.ok(lista);
    }

    // ✅ Obtener un recordatorio específico
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        Optional<Recordatorio> recordatorio = recordatorioRepository.findById(id);
        if (recordatorio.isEmpty())
            return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        return ResponseEntity.ok(recordatorio.get());
    }

    // ✅ Eliminar un recordatorio
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!recordatorioRepository.existsById(id))
            return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        recordatorioRepository.deleteById(id);
        return ResponseEntity.ok("🗑️ Recordatorio eliminado correctamente");
    }

    // ✅ Marcar un recordatorio como tomado (solo cuando el usuario lo haga manualmente)
    @PutMapping("/{id}/tomado")
    public ResponseEntity<String> marcarComoTomado(@PathVariable Long id) {
        Optional<Recordatorio> optionalRecordatorio = recordatorioRepository.findById(id);

        if (optionalRecordatorio.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        }

        Recordatorio recordatorio = optionalRecordatorio.get();

        // Marcar como tomado
        recordatorio.setTomado(true);
        recordatorioRepository.save(recordatorio);

        return ResponseEntity.ok("✅ Recordatorio marcado como tomado");
    }

    // ✅ Restablecer estado (para pruebas o reinicios de recordatorios)
    @PutMapping("/{id}/reset")
    public ResponseEntity<String> resetearRecordatorio(@PathVariable Long id) {
        Optional<Recordatorio> optionalRecordatorio = recordatorioRepository.findById(id);
        if (optionalRecordatorio.isEmpty()) {
            return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        }

        Recordatorio r = optionalRecordatorio.get();
        r.setTomado(false);
        r.setNotificado(false);
        r.setAlertaEnviada(false);
        r.setNotificadoAt(null);
        recordatorioRepository.save(r);

        return ResponseEntity.ok("🔁 Recordatorio reiniciado correctamente");
    }
}
