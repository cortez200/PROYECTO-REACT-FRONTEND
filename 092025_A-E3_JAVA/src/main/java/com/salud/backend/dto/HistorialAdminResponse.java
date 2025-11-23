package com.salud.backend.dto;

import java.time.LocalDate;

public class HistorialAdminResponse {
    private Long id;
    private LocalDate fecha;
    private String pacienteNombre;
    private Long pacienteId;
    private String archivoNombre;
    private String archivoUrl;

    public HistorialAdminResponse() {}

    public HistorialAdminResponse(Long id, LocalDate fecha, String pacienteNombre, Long pacienteId, String archivoNombre, String archivoUrl) {
        this.id = id;
        this.fecha = fecha;
        this.pacienteNombre = pacienteNombre;
        this.pacienteId = pacienteId;
        this.archivoNombre = archivoNombre;
        this.archivoUrl = archivoUrl;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getPacienteNombre() { return pacienteNombre; }
    public void setPacienteNombre(String pacienteNombre) { this.pacienteNombre = pacienteNombre; }

    public Long getPacienteId() { return pacienteId; }
    public void setPacienteId(Long pacienteId) { this.pacienteId = pacienteId; }

    public String getArchivoNombre() { return archivoNombre; }
    public void setArchivoNombre(String archivoNombre) { this.archivoNombre = archivoNombre; }

    public String getArchivoUrl() { return archivoUrl; }
    public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }
}