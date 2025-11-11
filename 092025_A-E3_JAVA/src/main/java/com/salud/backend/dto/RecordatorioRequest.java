package com.salud.backend.dto;

import java.time.LocalDateTime;

public class RecordatorioRequest {

    private String descripcion;
    private LocalDateTime fechaHora;
    private Long usuarioId;

    public RecordatorioRequest() {}

    public RecordatorioRequest(String descripcion, LocalDateTime fechaHora, Long usuarioId) {
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
        this.usuarioId = usuarioId;
    }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }

    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
}
