package com.salud.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling // ⚡ Activa tareas programadas (como el envío automático)
public class BackendApplication {

    @PostConstruct
    public void init() {
        // 🌎 Configurar zona horaria global a Perú
        TimeZone.setDefault(TimeZone.getTimeZone("America/Lima"));
        System.out.println("✅ Zona horaria establecida: " + TimeZone.getDefault().getID());
    }

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        System.out.println("🚀 Backend iniciado correctamente en zona horaria de Perú 🇵🇪");
    }
}
