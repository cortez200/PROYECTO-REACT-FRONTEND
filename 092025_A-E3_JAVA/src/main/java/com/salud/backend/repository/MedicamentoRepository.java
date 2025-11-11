package com.salud.backend.repository;

import com.salud.backend.model.Medicamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {
    List<Medicamento> findByHistorialId(Long historialId);
}
