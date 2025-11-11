package com.salud.backend.controller;

import com.salud.backend.model.Cita;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.CitaRepository;
import com.salud.backend.repository.UsuarioRepository;
import com.salud.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173")
public class CitaController {

    @Autowired
    private CitaRepository citaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Crear cita
    @PostMapping("/crear")
    public ResponseEntity<?> crearCita(@RequestBody Map<String, Object> body) {
        try {
            Long usuarioId = Long.parseLong(body.get("usuarioId").toString());
            String fechaStr = body.get("fecha").toString();
            String horaStr = body.get("hora").toString();
            String medico = body.get("medico").toString();
            String motivo = body.get("motivo").toString();

            Optional<Usuario> usuarioOpt = usuarioRepository.findById(usuarioId);
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("❌ Usuario no encontrado");
            }

            LocalDate fecha = LocalDate.parse(fechaStr);
            LocalTime hora = LocalTime.parse(horaStr);
            boolean existe = citaRepository.existsByFechaAndHora(fecha, hora);
            if (existe) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("❌ Esa hora ya está ocupada. Elige otra por favor.");
            }

            Cita cita = new Cita();
            cita.setUsuario(usuarioOpt.get());
            cita.setFecha(fecha);
            cita.setHora(hora);
            cita.setMedico(medico);
            cita.setMotivo(motivo);
            citaRepository.save(cita);

            // ✉️ Enviar correo de confirmación
            String asunto = "📅 Confirmación de Cita Médica - Salud Digital";
            String mensaje = """
                <div style='font-family: Arial, sans-serif; padding: 20px; background: #f8fbff; border-radius: 10px;'>
                    <h2 style='color:#0284c7;'>Confirmación de Cita</h2>
                    <p>Hola <b>%s</b>,</p>
                    <p>Tu cita médica ha sido registrada correctamente:</p>
                    <ul>
                        <li>🗓 <b>Fecha:</b> %s</li>
                        <li>⏰ <b>Hora:</b> %s</li>
                        <li>👨‍⚕️ <b>Médico:</b> %s</li>
                        <li>📋 <b>Motivo:</b> %s</li>
                    </ul>
                    <p>Gracias por confiar en <b>Salud Digital</b>.</p>
                    <hr/>
                    <p style='font-size:12px;color:#555;'>Salud Digital © 2025 - “Tu bienestar es nuestra prioridad”</p>
                </div>
                """.formatted(
                    usuarioOpt.get().getNombre(),
                    fecha,
                    hora,
                    medico,
                    motivo
            );

            emailService.enviarCorreo(usuarioOpt.get().getCorreo(), asunto, mensaje);

            return ResponseEntity.ok("✅ Cita creada correctamente y correo enviado.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("❌ Error al registrar la cita: " + e.getMessage());
        }
    }

    // ✅ Listar citas por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable Long usuarioId) {
        try {
            List<Cita> citas = citaRepository.findByUsuario_Id(usuarioId);
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error al obtener las citas del usuario.");
        }
    }

    // ✅ Eliminar cita (y enviar correo)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarCita(@PathVariable Long id) {
        Optional<Cita> citaOpt = citaRepository.findById(id);

        if (citaOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("❌ Cita no encontrada");
        }

        Cita cita = citaOpt.get();
        Usuario usuario = cita.getUsuario();

        citaRepository.deleteById(id);

        // ✉️ Enviar correo de cancelación
        try {
            String asunto = "❌ Cita Cancelada - Salud Digital";
            String mensaje = """
                <div style='font-family: Arial, sans-serif; padding: 20px; background: #fff0f0; border-radius: 10px;'>
                    <h2 style='color:#dc2626;'>Tu cita ha sido cancelada</h2>
                    <p>Hola <b>%s</b>,</p>
                    <p>Tu cita programada fue cancelada con los siguientes detalles:</p>
                    <ul>
                        <li>🗓 <b>Fecha:</b> %s</li>
                        <li>⏰ <b>Hora:</b> %s</li>
                        <li>👨‍⚕️ <b>Médico:</b> %s</li>
                        <li>📋 <b>Motivo:</b> %s</li>
                    </ul>
                    <p>Si deseas reprogramar, puedes hacerlo fácilmente desde la plataforma.</p>
                    <hr/>
                    <p style='font-size:12px;color:#555;'>Salud Digital © 2025 - “Cuidando tu bienestar”</p>
                </div>
                """.formatted(
                    usuario.getNombre(),
                    cita.getFecha(),
                    cita.getHora(),
                    cita.getMedico(),
                    cita.getMotivo()
            );

            emailService.enviarCorreo(usuario.getCorreo(), asunto, mensaje);
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar correo de cancelación: " + e.getMessage());
        }

        return ResponseEntity.ok("✅ Cita eliminada correctamente");
    }
}
