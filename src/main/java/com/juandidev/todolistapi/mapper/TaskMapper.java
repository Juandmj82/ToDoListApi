package com.juandidev.todolistapi.mapper;

import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.model.Task;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class TaskMapper {

    public TaskResponse toTaskResponse(Task task) {
        if (task == null) {
            return null;
        }

        // Corregimos los argumentos para que coincidan con la nueva firma del constructor de TaskResponse
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.isCompleted(),
                task.getCreatedAt()
        );
    }
}