package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.TaskRequest;
import com.juandidev.todolistapi.dto.response.TaskResponse;

import java.util.List;
import java.util.Optional;

public interface ITaskService {
    List<TaskResponse> findAllTasks();
    Optional<TaskResponse> findTaskById(Long id);
    TaskResponse createTask(TaskRequest taskRequest);
    TaskResponse updateTask(Long id, TaskRequest taskRequest);
    void deleteTask(Long id);
    List<TaskResponse> findTasksByEstado(boolean estado);
    List<TaskResponse> findTasksByResponsable(String responsable);
}