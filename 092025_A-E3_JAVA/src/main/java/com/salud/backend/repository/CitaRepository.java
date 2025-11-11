package com.salud.backend.repository;

import com.salud.backend.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    // ✅ Buscar todas las citas de un usuario (correcto: accede al objeto Usuario)
    List<Cita> findByUsuario_Id(Long usuarioId);

    // ✅ Verificar si ya existe una cita con el mismo médico, fecha y hora
    boolean existsByMedicoAndFechaAndHora(String medico, LocalDate fecha, LocalTime hora);

    // ✅ Verificar si ya existe una cita en esa fecha y hora (sin importar el médico)
    boolean existsByFechaAndHora(LocalDate fecha, LocalTime hora);
}
