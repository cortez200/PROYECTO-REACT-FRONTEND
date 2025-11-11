package com.salud.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "historial")
public class Historial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String descripcion;
    private LocalDate fecha;

    @ManyToOne
    @JoinColumn(name = "paciente_id")
    private Usuario paciente;

    public Historial() {}

    public Historial(String descripcion, LocalDate fecha, Usuario paciente) {
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.paciente = paciente;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public Usuario getPaciente() { return paciente; }
    public void setPaciente(Usuario paciente) { this.paciente = paciente; }
}
