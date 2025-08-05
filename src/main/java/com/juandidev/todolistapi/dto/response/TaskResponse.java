package com.juandidev.todolistapi.dto.response;

import java.time.LocalDateTime;

public record TaskResponse(
        Long id,
        String title,
        String description,
        LocalDateTime dueDate,
        boolean completed,
        LocalDateTime createdAt,
        UserResponse user
) {}