package com.salud.backend.service;

import com.salud.backend.model.Familiar;
import com.salud.backend.model.Usuario;
import com.salud.backend.repository.FamiliarRepository;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FamiliarService {

    @Autowired
    private FamiliarRepository familiarRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    // ✅ Listar familiares por usuario
    public List<Familiar> listarPorUsuario(Long usuarioId) {
        return familiarRepo.findByUsuario_IdOrderByIdDesc(usuarioId);
    }

    // ✅ Crear familiar vinculado a un usuario
    public Familiar crearFamiliar(Long usuarioId, String nombre, String relacion, String correo) {
        Usuario usuario = usuarioRepo.findById(usuarioId).orElse(null);
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado");
        }

        Familiar familiar = new Familiar();
        familiar.setUsuario(usuario);
        familiar.setNombre(nombre);
        familiar.setRelacion(relacion);
        familiar.setCorreo(correo);

        return familiarRepo.save(familiar);
    }

    // ✅ Actualizar familiar
    public Familiar actualizar(Long id, Familiar datos) {
        Optional<Familiar> opt = familiarRepo.findById(id);
        if (opt.isEmpty()) {
            throw new RuntimeException("Familiar no encontrado");
        }

        Familiar existente = opt.get();
        existente.setNombre(datos.getNombre());
        existente.setRelacion(datos.getRelacion());
        existente.setCorreo(datos.getCorreo());

        return familiarRepo.save(existente);
    }

    // ✅ Eliminar familiar
    public void eliminar(Long id) {
        familiarRepo.deleteById(id);
    }
}
