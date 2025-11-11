package com.salud.backend.controller;

import com.salud.backend.dto.HistorialResponse;
import com.salud.backend.model.Historial;
import com.salud.backend.service.HistorialService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = "http://localhost:5173")
public class HistorialController {

    private final HistorialService historialService;

    public HistorialController(HistorialService historialService) {
        this.historialService = historialService;
    }

    // ✅ Obtener el historial de un paciente por su ID
    @GetMapping("/{pacienteId}")
    public ResponseEntity<List<HistorialResponse>> obtenerHistorial(@PathVariable Long pacienteId) {
        List<HistorialResponse> historial = historialService.obtenerPorPaciente(pacienteId);
        return ResponseEntity.ok(historial);
    }

    // ✅ Crear una nueva entrada de historial
    @PostMapping
    public ResponseEntity<Historial> crearHistorial(@RequestBody Historial historial) {
        Historial nuevo = historialService.crearHistorial(historial);
        return ResponseEntity.ok(nuevo);
    }

    // ✅ Eliminar una entrada de historial
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHistorial(@PathVariable Long id) {
        boolean eliminado = historialService.eliminarHistorial(id);
        if (!eliminado) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.noContent().build();
    }
}