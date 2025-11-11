package com.salud.backend.repository;

import com.salud.backend.model.Historial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialRepository extends JpaRepository<Historial, Long> {
    List<Historial> findByPacienteId(Long pacienteId);
}
