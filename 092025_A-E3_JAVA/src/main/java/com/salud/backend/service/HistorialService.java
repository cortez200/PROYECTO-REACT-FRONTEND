package com.salud.backend.service;

import com.salud.backend.dto.HistorialAdminResponse;
import com.salud.backend.dto.HistorialResponse;
import com.salud.backend.model.Cita;
import com.salud.backend.model.Historial;
import com.salud.backend.model.Recordatorio;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.CitaRepository;
import com.salud.backend.repository.HistorialRepository;
import com.salud.backend.repository.RecordatorioRepository;
import com.salud.backend.repository.UsuarioRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class HistorialService {

    private final HistorialRepository historialRepository;
    private final UsuarioRepository usuarioRepository;
    private final RecordatorioRepository recordatorioRepository;
    private final CitaRepository citaRepository;

    public HistorialService(HistorialRepository historialRepository,
                            UsuarioRepository usuarioRepository,
                            RecordatorioRepository recordatorioRepository,
                            CitaRepository citaRepository) {
        this.historialRepository = historialRepository;
        this.usuarioRepository = usuarioRepository;
        this.recordatorioRepository = recordatorioRepository;
        this.citaRepository = citaRepository;
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

    // ✅ Listar un único historial por paciente (último) para Admin
    public List<HistorialAdminResponse> listarTodos() {
        Map<Long, Historial> porPaciente = historialRepository.findAll().stream()
                .filter(h -> h.getPaciente() != null && h.getPaciente().getId() != null)
                .collect(Collectors.groupingBy(h -> h.getPaciente().getId(),
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparing(Historial::getId)),
                                Optional::get
                        )));

        return porPaciente.values().stream().map(h -> {
            String nombre = h.getPaciente().getNombre();
            Long pid = h.getPaciente().getId();
            String archivoNombre = (h.getArchivoNombre() != null && !h.getArchivoNombre().isEmpty())
                    ? h.getArchivoNombre()
                    : ("historial-paciente-" + pid + ".pdf");
            String archivoUrl = "/api/historial/" + h.getId() + "/pdf";
            return new HistorialAdminResponse(h.getId(), h.getFecha(), nombre, pid, archivoNombre, archivoUrl);
        }).collect(Collectors.toList());
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

    // ✅ Obtener el recurso PDF asociado a un historial
    public Resource obtenerPdf(Long id) throws Exception {
        Optional<Historial> opt = historialRepository.findById(id);
        if (opt.isEmpty()) return null;
        Historial h = opt.get();

        // Prioridad 1: ruta por paciente (persistente y con diseño)
        Long pacienteId = (h.getPaciente() != null) ? h.getPaciente().getId() : null;
        if (pacienteId != null) {
            Path patientPath = Paths.get("uploads", "historiales", "historial-paciente-" + pacienteId + ".pdf")
                    .toAbsolutePath().normalize();
            if (Files.exists(patientPath)) return new UrlResource(patientPath.toUri());
        }

        // Prioridad 2: ruta almacenada en DB
        if (h.getArchivoRuta() != null && !h.getArchivoRuta().isEmpty()) {
            Path path = Paths.get(h.getArchivoRuta()).toAbsolutePath().normalize();
            if (Files.exists(path)) return new UrlResource(path.toUri());
        }

        // Prioridad 3: ruta antigua por id
        Path legacyPath = Paths.get("uploads", "historiales", "historial-" + id + ".pdf")
                .toAbsolutePath().normalize();
        if (Files.exists(legacyPath)) return new UrlResource(legacyPath.toUri());

        // Si no existe ningún PDF, lo generamos y devolvemos
        if (pacienteId != null) {
            Historial actualizado = generarPdfDePaciente(pacienteId);
            if (actualizado.getArchivoRuta() != null) {
                Path newPath = Paths.get(actualizado.getArchivoRuta()).toAbsolutePath().normalize();
                if (Files.exists(newPath)) return new UrlResource(newPath.toUri());
            }
        }

        return null;
    }

    // ✅ Generar/actualizar PDF del historial para un paciente con sus datos actuales
    public Historial generarPdfDePaciente(Long pacienteId) throws Exception {
        Optional<Usuario> usuarioOpt = usuarioRepository.findById(pacienteId);
        if (usuarioOpt.isEmpty()) {
            throw new RuntimeException("Usuario no encontrado");
        }
        Usuario usuario = usuarioOpt.get();

        // Reusar historial existente del paciente o crear uno nuevo si no existe
        Historial h = historialRepository
                .findFirstByPacienteIdOrderByIdDesc(pacienteId)
                .orElseGet(() -> new Historial("Actualización automática", LocalDate.now(), usuario));

        // Actualizar fecha/descripcion para reflejar la última generación
        h.setDescripcion("Actualización automática");
        h.setFecha(LocalDate.now());
        h.setPaciente(usuario);
        h = historialRepository.save(h);

        // Recopilar datos
        List<Recordatorio> tomados = recordatorioRepository
                .findByUsuario_IdOrderByFechaHoraAsc(pacienteId)
                .stream()
                .filter(Recordatorio::isTomado)
                .collect(Collectors.toList());
        List<Cita> citas = citaRepository.findByUsuario_Id(pacienteId);

        // Generar PDF con diseño similar al del paciente
        Path outDir = Paths.get("uploads", "historiales");
        Files.createDirectories(outDir);
        Path outPath = outDir.resolve("historial-paciente-" + pacienteId + ".pdf");
        try { if (Files.exists(outPath)) Files.delete(outPath); } catch (IOException ignored) {}

        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage();
            doc.addPage(page);

            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                DateTimeFormatter fechaFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");

                // Encabezado azul (como en paciente)
                cs.setNonStrokingColor(2, 132, 199); // azul
                cs.addRect(0, pageHeight - 60, pageWidth, 60);
                cs.fill();

                // Título blanco centrado
                cs.beginText();
                cs.setNonStrokingColor(255, 255, 255);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 20);
                String titulo = "SALUD DIGITAL";
                float tituloWidth = (PDType1Font.HELVETICA_BOLD.getStringWidth(titulo) / 1000f) * 20f;
                float tituloX = (pageWidth - tituloWidth) / 2f;
                cs.newLineAtOffset(tituloX, pageHeight - 40);
                cs.showText(titulo);
                cs.endText();

                // Subtítulo
                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 12);
                cs.newLineAtOffset(pageWidth - 20, pageHeight - 40);
                cs.showText("Centro de Bienestar y Salud Integral");
                cs.endText();

                // Línea separadora
                cs.setStrokingColor(2, 132, 199);
                cs.setLineWidth(0.8f);
                cs.moveTo(20, pageHeight - 70);
                cs.lineTo(pageWidth - 20, pageHeight - 70);
                cs.stroke();

                // Tarjeta de datos del paciente
                cs.setNonStrokingColor(245, 247, 250); // gris fondo
                cs.addRect(20, pageHeight - 120, pageWidth - 40, 40);
                cs.fill();

                cs.beginText();
                cs.setNonStrokingColor(2, 132, 199);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 12);
                cs.newLineAtOffset(28, pageHeight - 100);
                cs.showText("Datos del Paciente");
                cs.endText();

                cs.beginText();
                cs.setNonStrokingColor(0, 0, 0);
                cs.setFont(PDType1Font.HELVETICA, 11);
                cs.newLineAtOffset(28, pageHeight - 112);
                cs.showText("Nombre: " + (usuario.getNombre() != null ? usuario.getNombre() : "No disponible"));
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA, 11);
                cs.newLineAtOffset(pageWidth/2, pageHeight - 112);
                cs.showText("Correo: " + (usuario.getCorreo() != null ? usuario.getCorreo() : "No disponible"));
                cs.endText();

                // Sección Medicaciones Tomadas - tabla con encabezado azul y zebra
                float y = pageHeight - 150;
                cs.beginText();
                cs.setNonStrokingColor(2, 132, 199);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.newLineAtOffset(20, y);
                cs.showText("Medicaciones Tomadas");
                cs.endText();
                y -= 18;

                float tableX = 20f;
                float tableW = pageWidth - 40f;
                float col1W = tableW * 0.55f;
                float col2W = tableW - col1W;

                // Encabezado
                cs.setNonStrokingColor(2, 132, 199);
                cs.addRect(tableX, y, tableW, 22);
                cs.fill();
                cs.setStrokingColor(255, 255, 255);
                cs.setLineWidth(0.8f);
                cs.moveTo(tableX + col1W, y);
                cs.lineTo(tableX + col1W, y + 22);
                cs.stroke();

                cs.beginText();
                cs.setNonStrokingColor(255, 255, 255);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
                cs.newLineAtOffset(tableX + 8, y + 7);
                cs.showText("Descripción");
                cs.endText();

                cs.beginText();
                cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
                cs.newLineAtOffset(tableX + col1W + 8, y + 7);
                cs.showText("Fecha y Hora");
                cs.endText();
                y -= 22;

                DateTimeFormatter fhFmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                if (tomados.isEmpty()) {
                    cs.beginText();
                    cs.setNonStrokingColor(80, 80, 80);
                    cs.setFont(PDType1Font.HELVETICA, 11);
                    cs.newLineAtOffset(tableX + 8, y - 14);
                    cs.showText("No se registran medicaciones tomadas.");
                    cs.endText();
                    y -= 28;
                } else {
                    int rowIdx = 0;
                    for (Recordatorio r : tomados) {
                        if (y < 120) break;
                        // zebra
                        if (rowIdx % 2 == 0) {
                            cs.setNonStrokingColor(230, 240, 250);
                            cs.addRect(tableX, y, tableW, 20);
                            cs.fill();
                        }
                        cs.setStrokingColor(226, 232, 240);
                        cs.setLineWidth(0.6f);
                        cs.addRect(tableX, y, tableW, 20);
                        cs.stroke();
                        cs.moveTo(tableX + col1W, y);
                        cs.lineTo(tableX + col1W, y + 20);
                        cs.stroke();

                        cs.beginText();
                        cs.setNonStrokingColor(0, 0, 0);
                        cs.setFont(PDType1Font.HELVETICA, 11);
                        cs.newLineAtOffset(tableX + 8, y + 6);
                        cs.showText(r.getDescripcion() != null ? r.getDescripcion() : "-");
                        cs.endText();

                        String fh = "";
                        try { fh = r.getFechaHora() != null ? r.getFechaHora().format(fhFmt) : ""; } catch (Exception ignored) {}
                        cs.beginText();
                        cs.setFont(PDType1Font.HELVETICA, 11);
                        cs.newLineAtOffset(tableX + col1W + 8, y + 6);
                        cs.showText(fh);
                        cs.endText();
                        y -= 20;
                        rowIdx++;
                    }
                }

                // Sección Citas Registradas
                y -= 6;
                cs.beginText();
                cs.setNonStrokingColor(2, 132, 199);
                cs.setFont(PDType1Font.HELVETICA_BOLD, 13);
                cs.newLineAtOffset(20, y);
                cs.showText("Citas Registradas");
                cs.endText();
                y -= 16;

                if (citas.isEmpty()) {
                    cs.beginText();
                    cs.setNonStrokingColor(80, 80, 80);
                    cs.setFont(PDType1Font.HELVETICA, 11);
                    cs.newLineAtOffset(20, y);
                    cs.showText("No hay citas registradas.");
                    cs.endText();
                } else {
                    float cTableX = 20f;
                    float cTableW = pageWidth - 40f;
                    float cCol1W = cTableW * 0.45f;
                    float cCol2W = cTableW * 0.30f;
                    float cCol3W = cTableW - cCol1W - cCol2W;

                    // Encabezado
                    cs.setNonStrokingColor(2, 132, 199);
                    cs.addRect(cTableX, y, cTableW, 22);
                    cs.fill();
                    cs.setStrokingColor(255, 255, 255);
                    cs.setLineWidth(0.8f);
                    cs.moveTo(cTableX + cCol1W, y);
                    cs.lineTo(cTableX + cCol1W, y + 22);
                    cs.stroke();
                    cs.moveTo(cTableX + cCol1W + cCol2W, y);
                    cs.lineTo(cTableX + cCol1W + cCol2W, y + 22);
                    cs.stroke();

                    cs.beginText();
                    cs.setNonStrokingColor(255, 255, 255);
                    cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
                    cs.newLineAtOffset(cTableX + 8, y + 7);
                    cs.showText("Motivo");
                    cs.endText();
                    cs.beginText();
                    cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
                    cs.newLineAtOffset(cTableX + cCol1W + 8, y + 7);
                    cs.showText("Fecha");
                    cs.endText();
                    cs.beginText();
                    cs.setFont(PDType1Font.HELVETICA_BOLD, 11);
                    cs.newLineAtOffset(cTableX + cCol1W + cCol2W + 8, y + 7);
                    cs.showText("Hora");
                    cs.endText();
                    y -= 22;

                    int cRowIdx = 0;
                    for (Cita c : citas) {
                        if (y < 80) break;
                        if (cRowIdx % 2 == 0) {
                            cs.setNonStrokingColor(230, 240, 250);
                            cs.addRect(cTableX, y, cTableW, 20);
                            cs.fill();
                        }
                        cs.setStrokingColor(226, 232, 240);
                        cs.setLineWidth(0.6f);
                        cs.addRect(cTableX, y, cTableW, 20);
                        cs.stroke();
                        cs.moveTo(cTableX + cCol1W, y);
                        cs.lineTo(cTableX + cCol1W, y + 20);
                        cs.stroke();
                        cs.moveTo(cTableX + cCol1W + cCol2W, y);
                        cs.lineTo(cTableX + cCol1W + cCol2W, y + 20);
                        cs.stroke();

                        cs.beginText();
                        cs.setNonStrokingColor(0, 0, 0);
                        cs.setFont(PDType1Font.HELVETICA, 11);
                        cs.newLineAtOffset(cTableX + 8, y + 6);
                        cs.showText(c.getMotivo() != null ? c.getMotivo() : "No especificado");
                        cs.endText();
                        cs.beginText();
                        cs.setFont(PDType1Font.HELVETICA, 11);
                        cs.newLineAtOffset(cTableX + cCol1W + 8, y + 6);
                        cs.showText(c.getFecha() != null ? c.getFecha().format(fechaFmt) : "");
                        cs.endText();
                        cs.beginText();
                        cs.setFont(PDType1Font.HELVETICA, 11);
                        cs.newLineAtOffset(cTableX + cCol1W + cCol2W + 8, y + 6);
                        cs.showText(c.getHora() != null ? c.getHora().toString() : "");
                        cs.endText();
                        y -= 20;
                        cRowIdx++;
                    }
                }

                // Pie de página
                cs.setStrokingColor(220, 220, 220);
                cs.moveTo(20, 60);
                cs.lineTo(pageWidth - 20, 60);
                cs.stroke();

                cs.beginText();
                cs.setNonStrokingColor(120, 120, 120);
                cs.setFont(PDType1Font.HELVETICA, 10);
                cs.newLineAtOffset(pageWidth/2, 46);
                cs.showText("Salud Digital © " + LocalDate.now().getYear() + " — Reporte generado automáticamente.");
                cs.endText();
            }

            doc.save(outPath.toFile());
        } catch (IOException e) {
            throw new RuntimeException("Error generando PDF: " + e.getMessage());
        }

        h.setArchivoNombre("historial-paciente-" + pacienteId + ".pdf");
        h.setArchivoRuta(outPath.toString());
        historialRepository.save(h);
        return h;
    }
}