package com.salud.backend.service;

import com.salud.backend.model.Usuario;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepo;

    public UsuarioService(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    // Crear usuario
    public Usuario crearUsuario(Usuario usuario) {
        return usuarioRepo.save(usuario);
    }

    // Listar todos
    public List<Usuario> listarUsuarios() {
        return usuarioRepo.findAll();
    }

    // Buscar por ID
    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepo.findById(id);
    }

    // Actualizar
    public Usuario actualizarUsuario(Long id, Usuario usuarioActualizado) {
        return usuarioRepo.findById(id).map(usuario -> {
            usuario.setNombre(usuarioActualizado.getNombre());
            usuario.setCorreo(usuarioActualizado.getCorreo());
            usuario.setPassword(usuarioActualizado.getPassword());
            usuario.setTipo(usuarioActualizado.getTipo()); // <--- corregido aquí
            return usuarioRepo.save(usuario);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    // Eliminar
    public void eliminarUsuario(Long id) {
        usuarioRepo.deleteById(id);
    }

    // Buscar por correo
    public Optional<Usuario> buscarPorCorreo(String correo) {
        return usuarioRepo.findByCorreo(correo);
    }
}
