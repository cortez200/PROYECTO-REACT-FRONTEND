package com.salud.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recordatorio")
public class Recordatorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descripcion;

    private LocalDateTime fechaHora;

    // ✅ El paciente confirmó/tomó (se marca desde el botón "Tomado")
    private boolean tomado;

    // ✅ Se envió el recordatorio (cuando disparó el correo a la hora indicada)
    private boolean notificado;

    // ✅ Cuándo se envió el recordatorio (para contar el tiempo de gracia)
    private LocalDateTime notificadoAt;

    // ✅ Ya se envió la alerta de “no confirmado”
    private boolean alertaEnviada;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    public Recordatorio() {}

    public Recordatorio(String descripcion, LocalDateTime fechaHora, boolean tomado, Usuario usuario) {
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
        this.tomado = tomado;
        this.usuario = usuario;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public boolean isTomado() { return tomado; }
    public void setTomado(boolean tomado) { this.tomado = tomado; }

    public boolean isNotificado() { return notificado; }
    public void setNotificado(boolean notificado) { this.notificado = notificado; }

    public LocalDateTime getNotificadoAt() { return notificadoAt; }
    public void setNotificadoAt(LocalDateTime notificadoAt) { this.notificadoAt = notificadoAt; }

    public boolean isAlertaEnviada() { return alertaEnviada; }
    public void setAlertaEnviada(boolean alertaEnviada) { this.alertaEnviada = alertaEnviada; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }
}
