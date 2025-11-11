package com.salud.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "medicamento")
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;
    private String dosis;
    private String frecuencia;

    @ManyToOne
    @JoinColumn(name = "historial_id")
    private Historial historial;

    public Medicamento() {}

    public Medicamento(String nombre, String dosis, String frecuencia, Historial historial) {
        this.nombre = nombre;
        this.dosis = dosis;
        this.frecuencia = frecuencia;
        this.historial = historial;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getDosis() { return dosis; }
    public void setDosis(String dosis) { this.dosis = dosis; }

    public String getFrecuencia() { return frecuencia; }
    public void setFrecuencia(String frecuencia) { this.frecuencia = frecuencia; }

    public Historial getHistorial() { return historial; }
    public void setHistorial(Historial historial) { this.historial = historial; }
}
