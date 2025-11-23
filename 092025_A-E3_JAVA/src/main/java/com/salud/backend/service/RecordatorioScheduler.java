package com.salud.backend.service;

import com.salud.backend.model.Recordatorio;
import com.salud.backend.model.Familiar;
import com.salud.backend.repository.RecordatorioRepository;
import com.salud.backend.repository.FamiliarRepository;
import jakarta.mail.MessagingException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class RecordatorioScheduler {

    @Autowired
    private RecordatorioRepository recordatorioRepository;

    @Autowired
    private FamiliarRepository familiarRepository;

    @Autowired
    private EmailService emailService;

    // ⏱️ Minutos de gracia antes de alertar (configurable en application.properties)
    @Value("${recordatorios.graciaMinutos:10}")
    private int graciaMinutos;

    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

    // 🕐 Revisa cada 30s para enviar el recordatorio a la hora programada
    @Scheduled(fixedRate = 30000)
    public void enviarRecordatorios() {
        LocalDateTime ahora = LocalDateTime.now(ZONA_PERU);
        List<Recordatorio> pendientes = recordatorioRepository.findByActivoTrueAndNotificadoFalse();

        for (Recordatorio r : pendientes) {
            if (r.getFechaHora() == null) continue;

            long diff = Duration.between(ahora, r.getFechaHora()).getSeconds();

            // Dentro de la ventana de 60s alrededor de la hora objetivo
            if (Math.abs(diff) <= 60) {
                try {
                    String asunto = "💊 Recordatorio de Medicina - Salud Digital";
                    String cuerpo = plantillaRecordatorioPaciente(r);

                    // Al paciente
                    emailService.enviarCorreo(r.getUsuario().getCorreo(), asunto, cuerpo);

                    // A los familiares
                    List<Familiar> familiares = familiarRepository.findByUsuario_Id(r.getUsuario().getId());
                    for (Familiar f : familiares) {
                        String cuerpoFam = plantillaRecordatorioFamiliar(r, f);
                        emailService.enviarCorreo(f.getCorreo(), asunto, cuerpoFam);
                    }

                    // ⚠️ NO marcar como tomado. Solo marcar que ya fue notificado
                    r.setNotificado(true);
                    r.setNotificadoAt(ahora);
                    recordatorioRepository.save(r);

                    System.out.printf("✅ Recordatorio notificado a %s (%s)%n",
                            r.getUsuario().getNombre(), r.getUsuario().getCorreo());

                } catch (MessagingException e) {
                    System.err.println("⚠️ Error al enviar recordatorio: " + e.getMessage());
                }
            }
        }
    }

    // 🚨 Revisa cada minuto si ya pasó el tiempo de gracia y el paciente no confirmó
    @Scheduled(fixedRate = 60000)
    public void enviarAlertasNoConfirmadas() {
        LocalDateTime ahora = LocalDateTime.now(ZONA_PERU);
        List<Recordatorio> porAlertar =
                recordatorioRepository.findByActivoTrueAndNotificadoTrueAndTomadoFalseAndAlertaEnviadaFalse();

        for (Recordatorio r : porAlertar) {
            if (r.getNotificadoAt() == null) continue;

            long minTranscurridos = Duration.between(r.getNotificadoAt(), ahora).toMinutes();

            if (minTranscurridos >= graciaMinutos) {
                try {
                    String asunto = "🚨 Alerta: posible omisión de medicina - Salud Digital";

                    List<Familiar> familiares = familiarRepository.findByUsuario_Id(r.getUsuario().getId());
                    for (Familiar f : familiares) {
                        String cuerpoAlerta = plantillaAlertaNoConfirmada(r, f, graciaMinutos);
                        emailService.enviarCorreo(f.getCorreo(), asunto, cuerpoAlerta);
                    }

                    // (Opcional) Copia al paciente
                    // emailService.enviarCorreo(r.getUsuario().getCorreo(), asunto, plantillaAlertaPaciente(r, graciaMinutos));

                    r.setAlertaEnviada(true);
                    recordatorioRepository.save(r);

                    System.out.printf("🚨 Alerta enviada por no confirmación: paciente %s, recordatorio %d%n",
                            r.getUsuario().getNombre(), r.getId());

                } catch (MessagingException e) {
                    System.err.println("⚠️ Error al enviar alerta: " + e.getMessage());
                }
            }
        }
    }

    // =============== Plantillas de correo ===============

    private String plantillaRecordatorioPaciente(Recordatorio r) {
        DateTimeFormatter fmtFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter fmtHora = DateTimeFormatter.ofPattern("hh:mm a");
        return """
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9ff;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #0284c7; color: white; text-align: center; padding: 12px 0;">
                  <h2>💊 Recordatorio de Medicina</h2>
                </div>
                <div style="padding: 20px;">
                  <p>Hola <b>%s</b>,</p>
                  <p>Este es un recordatorio de tu medicamento programado:</p>
                  <ul style="line-height: 1.8;">
                    <li><b>📅 Fecha:</b> %s</li>
                    <li><b>⏰ Hora:</b> %s</li>
                    <li><b>💊 Medicina:</b> %s</li>
                  </ul>
                  <p style="margin-top: 15px;">Por favor, confirma en la plataforma cuando lo hayas tomado. 💙</p>
                  <p style="text-align: center; margin-top: 20px;">
                    <a href="http://localhost:5173/" style="background-color:#0284c7;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;">Abrir Salud Digital</a>
                  </p>
                </div>
              </div>
            </div>
        """.formatted(
                r.getUsuario().getNombre(),
                r.getFechaHora().format(fmtFecha),
                r.getFechaHora().format(fmtHora),
                r.getDescripcion()
        );
    }

    private String plantillaRecordatorioFamiliar(Recordatorio r, Familiar f) {
        DateTimeFormatter fmtFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter fmtHora = DateTimeFormatter.ofPattern("hh:mm a");
        return """
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f9ff;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background: #0ea5e9; color: white; text-align: center; padding: 12px 0;">
                  <h2>🔔 Recordatorio del paciente %s</h2>
                </div>
                <div style="padding: 20px;">
                  <p>Hola <b>%s</b>,</p>
                  <p>Tu familiar <b>%s</b> tiene un recordatorio médico programado:</p>
                  <ul style="line-height: 1.8;">
                    <li><b>📅 Fecha:</b> %s</li>
                    <li><b>⏰ Hora:</b> %s</li>
                    <li><b>💊 Medicina:</b> %s</li>
                  </ul>
                  <p style="margin-top: 15px;">Este aviso es solo informativo. Gracias por estar atento. 💙</p>
                </div>
              </div>
            </div>
        """.formatted(
                r.getUsuario().getNombre(),
                f.getNombre(),
                r.getUsuario().getNombre(),
                r.getFechaHora().format(fmtFecha),
                r.getFechaHora().format(fmtHora),
                r.getDescripcion()
        );
    }

    private String plantillaAlertaNoConfirmada(Recordatorio r, Familiar f, int minGracia) {
        DateTimeFormatter fmtFecha = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter fmtHora = DateTimeFormatter.ofPattern("hh:mm a");
        return """
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fff4f4;">
              <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
                <div style="background: #dc2626; color: white; text-align: center; padding: 12px 0;">
                  <h2>🚨 Alerta: posible omisión de medicina</h2>
                </div>
                <div style="padding: 20px; color:#333;">
                  <p>Hola <b>%s</b>,</p>
                  <p>Tu familiar <b>%s</b> no ha confirmado la toma de su medicamento dentro de los últimos <b>%d minutos</b>:</p>
                  <ul style="line-height: 1.8;">
                    <li><b>📅 Fecha:</b> %s</li>
                    <li><b>⏰ Hora:</b> %s</li>
                    <li><b>💊 Medicina:</b> %s</li>
                  </ul>
                  <p style="margin-top: 15px;">Te recomendamos verificar que se encuentre bien. 💙</p>
                </div>
              </div>
            </div>
        """.formatted(
                f.getNombre(),
                r.getUsuario().getNombre(),
                minGracia,
                r.getFechaHora().format(fmtFecha),
                r.getFechaHora().format(fmtHora),
                r.getDescripcion()
        );
    }
}
