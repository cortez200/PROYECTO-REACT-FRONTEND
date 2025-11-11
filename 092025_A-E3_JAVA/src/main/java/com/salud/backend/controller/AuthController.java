package com.salud.backend.controller;

import com.salud.backend.model.Usuario;
import com.salud.backend.repository.UsuarioRepository;
import com.salud.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private EmailService emailService;

    // ✅ REGISTRO CON CORREO DE BIENVENIDA ESTILIZADO
    @PostMapping("/register")
    public ResponseEntity<?> registrar(@RequestBody Usuario usuario) {
        var existente = usuarioRepository.findByCorreo(usuario.getCorreo()).orElse(null);

        if (existente != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("mensaje", "⚠️ Ya existe una cuenta con ese correo."));
        }

        usuarioRepository.save(usuario);

        // ✉️ Envío de correo de bienvenida con diseño tipo carta
        String asunto = "💙 Bienvenido a Salud Digital";

        String mensaje = """
        <table align="center" width="100%%" bgcolor="#eaf3fb" style="padding: 30px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" 
                     style="background-color: #ffffff; border-radius: 12px; 
                            border: 1px solid #d6e9fa; font-family: Arial, sans-serif; color: #333;">
                
                <!-- Encabezado -->
                <tr>
                  <td align="center" bgcolor="#0284c7" style="padding: 25px 15px;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: bold;">
                      Bienvenido a Salud Digital 💙
                    </h1>
                    <p style="color: #d9f0ff; margin: 8px 0 0; font-size: 15px;">
                    </p>
                  </td>
                </tr>

                <!-- Cuerpo -->
                <tr>
                  <td style="padding: 30px; font-size: 15px; line-height: 1.7; color: #333;">
                    <p style="font-size: 16px;">Hola <b>%s</b>,</p>

                    <p>¡Gracias por registrarte en <b>Salud Digital</b>! 🩷<br/>
                    A partir de ahora podrás gestionar tus <b>recordatorios de medicación</b> y tus <b>citas médicas</b> de forma sencilla y segura.</p>

                    <p>Nos alegra tenerte con nosotros. Nuestro equipo está comprometido en cuidar tu salud y facilitar tu día a día a través de la tecnología 💙.</p>

                    <!-- Tarjeta de datos -->
                    <table width="100%%" style="margin: 25px 0; border-collapse: collapse;">
                      <tr>
                        <td style="border: 1px solid #d1e7f5; border-radius: 10px; padding: 15px; background-color: #f9fcff;">
                          <p style="margin: 0 0 10px; font-weight: bold;">🧾 Datos de tu cuenta:</p>
                          <p style="margin: 4px 0;">👤 <b>Nombre:</b> %s</p>
                          <p style="margin: 4px 0;">📧 <b>Correo:</b> %s</p>
                          <p style="margin: 4px 0;">💼 <b>Tipo de cuenta:</b> %s</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin-top: 35px;">
                      Atentamente,<br/>
                      <b>El equipo de Salud Digital</b><br/>
                      <span style="color: #666; font-size: 13px;">“Innovación al servicio de tu salud”</span>
                    </p>
                  </td>
                </tr>

                <!-- Pie -->
                <tr>
                  <td align="center" bgcolor="#f2faff" style="padding: 15px;">
                    <p style="margin: 0; font-size: 13px; color: #666;">
                      📍 Salud Digital — Plataforma Médica en Línea © 2025
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        """.formatted(usuario.getNombre(), usuario.getNombre(), usuario.getCorreo(), usuario.getTipo());

        try {
            emailService.enviarCorreo(usuario.getCorreo(), asunto, mensaje);
            System.out.println("✅ Correo de bienvenida enviado a " + usuario.getCorreo());
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar correo de bienvenida: " + e.getMessage());
        }

        return ResponseEntity.ok(Map.of("mensaje", "✅ Usuario registrado correctamente"));
    }

    // ✅ LOGIN QUE DEVUELVE JSON (para React)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario usuario) {
        var existente = usuarioRepository.findByCorreo(usuario.getCorreo()).orElse(null);

        if (existente != null && existente.getPassword().equals(usuario.getPassword())) {
            return ResponseEntity.ok(Map.of(
                    "id", existente.getId(),
                    "nombre", existente.getNombre(),
                    "correo", existente.getCorreo(),
                    "tipo", existente.getTipo(),
                    "mensaje", "✅ Login exitoso"
            ));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "❌ Credenciales incorrectas"));
        }
    }
}
