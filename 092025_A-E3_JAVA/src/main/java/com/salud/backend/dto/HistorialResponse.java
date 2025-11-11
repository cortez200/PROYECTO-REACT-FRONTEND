package com.salud.backend.dto;

import java.time.LocalDate;

public class HistorialResponse {

    private Long id;
    private String descripcion;
    private LocalDate fecha;

    // ✅ Constructor vacío
    public HistorialResponse() {
    }

    // ✅ Constructor con parámetros (opcional)
    public HistorialResponse(Long id, String descripcion, LocalDate fecha) {
        this.id = id;
        this.descripcion = descripcion;
        this.fecha = fecha;
    }

    // ✅ Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }
}