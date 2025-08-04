package com.juandidev.todolistapi.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "El nombre de usuario es obligatorio")
    String username,
    
    @NotBlank(message = "La contraseña es obligatoria")
    String password
) {}
