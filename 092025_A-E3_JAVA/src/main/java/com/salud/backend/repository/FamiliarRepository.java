package com.salud.backend.repository;

import com.salud.backend.model.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FamiliarRepository extends JpaRepository<Familiar, Long> {
    // 🔹 Lista familiares de un usuario
    List<Familiar> findByUsuario_Id(Long usuarioId);

    // 🔹 Lista ordenada descendente (opcional)
    List<Familiar> findByUsuario_IdOrderByIdDesc(Long usuarioId);
}
