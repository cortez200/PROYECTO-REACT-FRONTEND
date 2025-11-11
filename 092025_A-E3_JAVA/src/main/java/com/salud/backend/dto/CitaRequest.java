package com.salud.backend.dto;

import java.time.LocalDateTime;

public class CitaRequest {

    private String motivo;
    private LocalDateTime fechaHora;
    private Long usuarioId;

    public CitaRequest() {}

    public CitaRequest(String motivo, LocalDateTime fechaHora, Long usuarioId) {
        this.motivo = motivo;
        this.fechaHora = fechaHora;
        this.usuarioId = usuarioId;
    }

    public String getMotivo() { return motivo; }
    public void setMotivo(String motivo) { this.motivo = motivo; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
