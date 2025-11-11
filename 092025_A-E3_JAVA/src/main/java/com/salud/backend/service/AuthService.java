package com.salud.backend.service; 
 
import com.salud.backend.model.Usuario; 
import com.salud.backend.repository.UsuarioRepository; 
import org.springframework.stereotype.Service; 
 
import java.util.Optional; 
 
@Service 
public class AuthService { 
 
    private final UsuarioRepository usuarioRepository; 
 
    public AuthService(UsuarioRepository usuarioRepository) { 
        this.usuarioRepository = usuarioRepository; 
    } 
 
    // ✅ Registrar usuario 
    public String registrarUsuario(Usuario usuario) { 
        Optional<Usuario> existente = usuarioRepository.findByCorreo(usuario.getCorreo()); 
        if (existente.isPresent()) { 
            return "El correo ya está registrado."; 
        } 
        usuarioRepository.save(usuario); 
        return "Registro exitoso."; 
    } 
 
    // ✅ Login usuario 
    public String loginUsuario(String correo, String password) { 
        Optional<Usuario> usuario = usuarioRepository.findByCorreo(correo); 
        if (usuario.isPresent() && usuario.get().getPassword().equals(password)) { 
            return "Login exitoso."; 
        } 
        return "Credenciales inválidas."; 
    } 
}