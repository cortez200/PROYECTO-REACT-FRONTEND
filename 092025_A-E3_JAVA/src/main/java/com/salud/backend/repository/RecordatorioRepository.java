package com.salud.backend.repository;

import com.salud.backend.model.Recordatorio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecordatorioRepository extends JpaRepository<Recordatorio, Long> {

    // ✅ Lista todos los recordatorios de un usuario (ordenados por fecha)
    List<Recordatorio> findByUsuario_IdOrderByFechaHoraAsc(Long usuarioId);

    // ✅ Versión simple por usuario
    List<Recordatorio> findByUsuario_Id(Long usuarioId);

    // ✅ Recordatorios que aún no han sido tomados (usado por el scheduler)
    List<Recordatorio> findByTomadoFalse();

    // ✅ Recordatorios no notificados (si manejas lógica de “notificación pendiente”)
    List<Recordatorio> findByNotificadoFalse();

    // ✅ Recordatorios ya notificados pero aún no tomados (para alertas de seguimiento)
    List<Recordatorio> findByNotificadoTrueAndTomadoFalseAndAlertaEnviadaFalse();
}
