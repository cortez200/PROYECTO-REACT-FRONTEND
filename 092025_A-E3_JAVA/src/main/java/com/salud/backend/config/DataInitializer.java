package com.salud.backend.config;

import com.salud.backend.model.Usuario;
import com.salud.backend.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

  @Bean
  CommandLineRunner initAdmin(UsuarioRepository usuarioRepository) {
    return args -> {
      usuarioRepository.findByCorreoIgnoreCase("admin@saluddigital.com").ifPresentOrElse(existing -> {
        boolean changed = false;
        if (existing.getTipo() != Usuario.TipoUsuario.ADMIN) { existing.setTipo(Usuario.TipoUsuario.ADMIN); changed = true; }
        if (existing.getPassword() == null || !existing.getPassword().equals("123456789")) { existing.setPassword("123456789"); changed = true; }
        if (existing.getNombre() == null || existing.getNombre().isBlank()) { existing.setNombre("Administrador"); changed = true; }
        if (changed) { usuarioRepository.save(existing); }
      }, () -> {
        Usuario admin = new Usuario("Administrador", "admin@saluddigital.com", "123456789", Usuario.TipoUsuario.ADMIN);
        usuarioRepository.save(admin);
      });
    };
  }
}