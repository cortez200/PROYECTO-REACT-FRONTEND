package com.salud.backend.controller;

import com.salud.backend.dto.HistorialAdminResponse;
import com.salud.backend.dto.HistorialResponse;
import com.salud.backend.model.Historial;
import com.salud.backend.service.HistorialService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/historial")
@CrossOrigin(origins = {"http://localhost:5173","http://localhost:5174"})
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

    // ✅ Listar todos los historiales (para Admin)
    @GetMapping("/todos")
    public ResponseEntity<List<HistorialAdminResponse>> listarTodos() {
      return ResponseEntity.ok(historialService.listarTodos());
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

    // ✅ Descargar/Ver PDF asociado al historial
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> descargarPdf(@PathVariable Long id) {
        try {
            Resource resource = historialService.obtenerPdf(id);
            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ✅ Generar/Actualizar PDF del historial para un paciente (se refleja en Admin)
    @PostMapping("/paciente/{pacienteId}/generar")
    public ResponseEntity<?> generarPdfPaciente(@PathVariable Long pacienteId) {
        try {
            Historial h = historialService.generarPdfDePaciente(pacienteId);
            return ResponseEntity.ok(Map.of(
                    "id", h.getId(),
                    "archivoNombre", h.getArchivoNombre(),
                    "archivoUrl", "/api/historial/" + h.getId() + "/pdf"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ Descargar PDF estilizado (forzado) para un paciente
    @GetMapping("/paciente/{pacienteId}/styled")
    public ResponseEntity<Resource> descargarPdfStyled(@PathVariable Long pacienteId) {
        try {
            Historial h = historialService.generarPdfDePaciente(pacienteId);
            Resource resource = historialService.obtenerPdf(h.getId());
            if (resource == null || !resource.exists()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_PDF)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}