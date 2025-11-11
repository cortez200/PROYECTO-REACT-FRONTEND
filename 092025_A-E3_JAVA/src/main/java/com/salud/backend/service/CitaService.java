package com.salud.backend.service;

import com.salud.backend.model.Cita;
import com.salud.backend.repository.CitaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
public class CitaService {

    @Autowired
    private CitaRepository citaRepository;

    // 🔹 Crear nueva cita (evita duplicados por médico, fecha y hora)
    public String crearCita(Cita cita) {
        if (citaRepository.existsByMedicoAndFechaAndHora(
                cita.getMedico(),
                cita.getFecha(),
                cita.getHora())) {
            return "❌ Ese médico ya tiene una cita programada a esa hora.";
        }

        citaRepository.save(cita);
        return "✅ Cita registrada correctamente.";
    }

    // 🔹 Obtener citas de un usuario
    public List<Cita> obtenerCitasPorUsuario(Long usuarioId) {
        return citaRepository.findByUsuario_Id(usuarioId);
    }

    // 🔹 Eliminar cita
    public void eliminarCita(Long id) {
        citaRepository.deleteById(id);
    }

    // 🔹 Listar todas las citas (opcional para admin)
    public List<Cita> listarTodas() {
        return citaRepository.findAll();
    }
}
