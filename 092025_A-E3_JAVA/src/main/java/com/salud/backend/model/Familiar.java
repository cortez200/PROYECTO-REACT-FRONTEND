package com.salud.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "familiares")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Familiar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nombre;

    private String relacion;

    private String correo;

    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
}
