package com.salud.backend.controller;

import com.salud.backend.model.Recordatorio;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.RecordatorioRepository;
import com.salud.backend.repository.UsuarioRepository;
import com.salud.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/recordatorios")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:4173", "http://127.0.0.1:4173"})
public class RecordatorioController {

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    private LocalDateTime parseFechaHoraFlexible(String valor) {
        if (valor == null || valor.isBlank()) return null;
        // Formatos aceptados: 2025-11-20T17:51:00 y 20/11/2025T17:51:00
        try {
            return LocalDateTime.parse(valor);
        } catch (DateTimeParseException e1) {
            try {
                DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy'T'HH:mm:ss");
                return LocalDateTime.parse(valor, fmt);
            } catch (DateTimeParseException e2) {
                throw e2; // Propagar para que el controlador informe error
            }
        }
    }

    // ✅ Listar todos (para ADMIN)
    @GetMapping
    public List<Recordatorio> listarTodos() {
        return recordatorioRepository.findAll();
    }

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

            LocalDateTime fechaHora = parseFechaHoraFlexible(fechaHoraIso);

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

    // ✅ Actualizar datos (descripcion/fechaHora/usuario)
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            Optional<Recordatorio> opt = recordatorioRepository.findById(id);
            if (opt.isEmpty()) return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");

            Recordatorio r = opt.get();

            // Valores anteriores para el correo
            String descAnterior = r.getDescripcion();
            LocalDateTime fechaHoraAnterior = r.getFechaHora();
            Usuario usuarioAnterior = r.getUsuario();

            if (body.containsKey("descripcion")) {
                r.setDescripcion(body.get("descripcion"));
            }
            if (body.containsKey("fechaHora")) {
                r.setFechaHora(parseFechaHoraFlexible(body.get("fechaHora")));
            }
            if (body.containsKey("usuarioId")) {
                Long usuarioId = Long.valueOf(body.get("usuarioId"));
                Usuario u = usuarioRepository.findById(usuarioId).orElse(null);
                if (u == null) return ResponseEntity.badRequest().body("Usuario no encontrado");
                r.setUsuario(u);
            }

            recordatorioRepository.save(r);

            // ✉️ Enviar correo avisando de la edición
            try {
                Usuario u = r.getUsuario();
                if (u != null && u.getCorreo() != null && !u.getCorreo().isBlank()) {
                    String asunto = "✏️ Actualización de Recordatorio de Medicación";
                    DateTimeFormatter fmtFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    DateTimeFormatter fmtHora = DateTimeFormatter.ofPattern("HH:mm");

                    String[] datosAntes = (descAnterior != null ? descAnterior : "").split("—");
                    String medAntes = datosAntes.length > 0 ? datosAntes[0].trim() : "";
                    String dosisAntes = datosAntes.length > 1 ? datosAntes[1].trim() : "";
                    String fAntes = fechaHoraAnterior != null ? fechaHoraAnterior.format(fmtFecha) : "";
                    String hAntes = fechaHoraAnterior != null ? fechaHoraAnterior.format(fmtHora) : "";

                    String[] datosAhora = (r.getDescripcion() != null ? r.getDescripcion() : "").split("—");
                    String medAhora = datosAhora.length > 0 ? datosAhora[0].trim() : "";
                    String dosisAhora = datosAhora.length > 1 ? datosAhora[1].trim() : "";
                    String fAhora = r.getFechaHora() != null ? r.getFechaHora().format(fmtFecha) : "";
                    String hAhora = r.getFechaHora() != null ? r.getFechaHora().format(fmtHora) : "";

                    String plantilla = (
                        """
                        <div style='font-family: Arial, sans-serif; padding: 20px; background: #f8fbff; border-radius: 10px;'>
                            <h2 style='color:#0284c7;'>Se actualizó tu recordatorio</h2>
                            <p>Hola <b>%s</b>, tu recordatorio de medicación fue <b>editado por el administrador</b>.</p>
                            <table style='border-collapse: collapse; width: 100%%;'>
                                <tr>
                                    <td style='border:1px solid #ddd; padding:8px;'><b>Antes</b></td>
                                    <td style='border:1px solid #ddd; padding:8px;'>%s — %s<br/>%s %s</td>
                                </tr>
                                <tr>
                                    <td style='border:1px solid #ddd; padding:8px;'><b>Ahora</b></td>
                                    <td style='border:1px solid #ddd; padding:8px;'>%s — %s<br/>%s %s</td>
                                </tr>
                            </table>
                            <p style='margin-top:12px;'>Si no reconoces este cambio, por favor contáctanos.</p>
                            <hr/>
                            <p style='font-size:12px;color:#555;'>Salud Digital © 2025</p>
                        </div>
                        """
                    );

                    String html = String.format(
                        plantilla,
                        u.getNombre(),
                        medAntes, dosisAntes, fAntes, hAntes,
                        medAhora, dosisAhora, fAhora, hAhora
                    );

                    emailService.enviarCorreo(u.getCorreo(), asunto, html);
                }
            } catch (Exception mailErr) {
                System.err.println("⚠️ Error al enviar correo de actualización: " + mailErr.getMessage());
            }
            return ResponseEntity.ok("✅ Recordatorio actualizado correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("❌ Error al actualizar: " + e.getMessage());
        }
    }

    // ✅ Alternativa para ambientes que no permiten PUT: actualizar vía POST
    @PostMapping("/{id}/actualizar")
    public ResponseEntity<?> actualizarViaPost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return actualizar(id, body);
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

    // ✅ Activar
    @PutMapping("/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable Long id) {
        Optional<Recordatorio> opt = recordatorioRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        Recordatorio r = opt.get();
        r.setActivo(true);
        recordatorioRepository.save(r);
        return ResponseEntity.ok("✅ Recordatorio activado");
    }

    // ✅ Desactivar
    @PutMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable Long id) {
        Optional<Recordatorio> opt = recordatorioRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.badRequest().body("❌ Recordatorio no encontrado");
        Recordatorio r = opt.get();
        r.setActivo(false);
        recordatorioRepository.save(r);
        return ResponseEntity.ok("🟡 Recordatorio desactivado");
    }
}
