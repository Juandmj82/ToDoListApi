package com.juandidev.todolistapi.dto.response;

import java.time.LocalDate;

public record TaskResponse(
        Long id,
        String titulo,
        String descripcion,
        String responsable,
        LocalDate fechaEntrega,
        boolean estado
) {
}
