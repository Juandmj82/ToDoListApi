package com.juandidev.todolistapi.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record TaskRequest(
        @NotBlank(message = "El titulo no puede estar vacio")
        @Size(max = 100, message = "El titulo no puede tener más de 100 caracteres")
        String titulo,

        @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
        @NotBlank(message = "La descripción no puede estar vacía")
        String descripcion,

        @NotBlank(message = "El responsable no puede estar vacío")
        String responsable,

        @Future(message = "La fecha de entrega debe ser igual o posterior a la fecha actual")
        LocalDate fechaEntrega,

        boolean estado
) {
}
