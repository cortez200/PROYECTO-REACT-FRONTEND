package com.salud.backend.service;

import com.salud.backend.dto.HistorialResponse;
import com.salud.backend.model.Historial;
import com.salud.backend.repository.HistorialRepository;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class HistorialService {

    private final HistorialRepository historialRepository;
    private final UsuarioRepository usuarioRepository;

    public HistorialService(HistorialRepository historialRepository, UsuarioRepository usuarioRepository) {
        this.historialRepository = historialRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public List<HistorialResponse> obtenerPorPaciente(Long pacienteId) {
        List<Historial> historialList = historialRepository.findByPacienteId(pacienteId);
        return historialList.stream().map(h -> {
            HistorialResponse resp = new HistorialResponse();
            resp.setId(h.getId());
            resp.setDescripcion(h.getDescripcion());
            resp.setFecha(h.getFecha());
            return resp;
        }).collect(Collectors.toList());
    }

    // ✅ Listar historial por paciente (entidades crudas)
    public List<Historial> listar(Long pacienteId) {
        return historialRepository.findByPacienteId(pacienteId);
    }

    public Historial crearHistorial(Historial historial) {
        if (historial.getPaciente() != null && historial.getPaciente().getId() != null) {
            Optional<com.salud.backend.model.Usuario> usuarioOpt = usuarioRepository.findById(historial.getPaciente().getId());
            usuarioOpt.ifPresent(historial::setPaciente);
        }
        return historialRepository.save(historial);
    }

    public boolean eliminarHistorial(Long id) {
        if (!historialRepository.existsById(id)) return false;
        historialRepository.deleteById(id);
        return true;
    }
}