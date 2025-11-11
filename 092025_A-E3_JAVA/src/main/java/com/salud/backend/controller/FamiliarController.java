package com.salud.backend.controller;

import com.salud.backend.model.Familiar;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.FamiliarRepository;
import com.salud.backend.repository.UsuarioRepository;
import com.salud.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/familiares")
@CrossOrigin(origins = "http://localhost:5173")
public class FamiliarController {

    @Autowired
    private FamiliarRepository familiarRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Crear un familiar
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Map<String, String> body) {
        try {
            Long usuarioId = Long.valueOf(body.get("usuarioId"));
            String nombre = body.get("nombre");
            String relacion = body.get("relacion");
            String correo = body.get("correo");

            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            if (usuario == null) {
                return ResponseEntity.badRequest().body("Usuario no encontrado");
            }

            Familiar f = new Familiar();
            f.setUsuario(usuario);
            f.setNombre(nombre);
            f.setRelacion(relacion);
            f.setCorreo(correo);

            familiarRepository.save(f);

            // ✅ Enviar correo de bienvenida
            try {
                String asunto = "👨‍👩‍👧 Has sido registrado como familiar en Salud Digital";
                String cuerpo = """
                        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f6f9ff;">
                            <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px;">
                                <h2 style="color: #0284c7; text-align: center;">Bienvenido a Salud Digital 💙</h2>
                                <p>Hola <b>%s</b>,</p>
                                <p>Has sido registrado como <b>%s</b> del paciente <b>%s</b>.</p>
                                <p>A partir de ahora, recibirás notificaciones si el paciente no confirma sus tomas o necesita asistencia.</p>
                                <br>
                                <p style="text-align:center;">
                                    <a href="http://localhost:5173/" style="background-color:#0284c7;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Abrir Salud Digital</a>
                                </p>
                                <br>
                                <p style="font-size:13px;color:#555;">Salud Digital © 2025 — “Cuidando tu bienestar y el de tu familia”.</p>
                            </div>
                        </div>
                        """.formatted(nombre, relacion, usuario.getNombre());

                emailService.enviarCorreo(correo, asunto, cuerpo);
            } catch (Exception e) {
                System.err.println("⚠️ Error al enviar correo de bienvenida: " + e.getMessage());
            }

            return ResponseEntity.ok(f);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Error al crear familiar: " + e.getMessage());
        }
    }

    // ✅ Listar familiares por usuario
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Familiar>> listarPorUsuario(@PathVariable Long usuarioId) {
        List<Familiar> familiares = familiarRepository.findByUsuario_Id(usuarioId);
        return ResponseEntity.ok(familiares);
    }

    // ✅ Eliminar un familiar
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        if (!familiarRepository.existsById(id)) {
            return ResponseEntity.badRequest().body("Familiar no encontrado");
        }
        familiarRepository.deleteById(id);
        return ResponseEntity.ok("Familiar eliminado correctamente");
    }
}
