package com.juandidev.todolistapi;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class EnvConfig {

    @Bean
    public Dotenv dotenv() {
        return Dotenv.configure()
                .directory("./")  // Busca el archivo .env en el directorio raíz
                .ignoreIfMissing()  // No falla si no encuentra el archivo
                .load();
    }
}