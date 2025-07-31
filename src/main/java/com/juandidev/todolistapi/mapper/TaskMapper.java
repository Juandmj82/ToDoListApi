package com.juandidev.todolistapi.mapper;

import com.juandidev.todolistapi.dto.request.TaskRequest;
import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.model.Task;
import org.springframework.stereotype.Component;


@Component
public class TaskMapper {

    public Task toEntity(TaskRequest request) {
        Task task = new Task();
        task.setTitulo(request.titulo());
        task.setDescripcion(request.descripcion());
        task.setResponsable(request.responsable());
        task.setFechaEntrega(request.fechaEntrega());
        task.setEstado(false); // Por defecto, la tarea inicia como no completada
        return task;
    }

    public TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitulo(),
                task.getDescripcion(),
                task.getResponsable(),
                task.getFechaEntrega(),
                task.isEstado()
        );
    }
}