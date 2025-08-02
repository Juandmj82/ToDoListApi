package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.TaskRequest;
import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.exception.TaskNotFoundException;
import com.juandidev.todolistapi.mapper.TaskMapper;
import com.juandidev.todolistapi.model.Task;
import com.juandidev.todolistapi.model.User;
import com.juandidev.todolistapi.repository.TaskRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements ITaskService {

    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findAllTasks() {
        User currentUser = getCurrentUser();
        return taskRepository.findByUser(currentUser).stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TaskResponse> findTaskById(Long id) {
        User currentUser = getCurrentUser();
        return taskRepository.findByIdAndUser(id, currentUser)
                .map(taskMapper::toResponse);
    }

    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest) {
        Task task = taskMapper.toEntity(taskRequest);
        task.setUser(getCurrentUser()); // Asignar el usuario actual
        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        User currentUser = getCurrentUser();
        Task existingTask = taskRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new TaskNotFoundException("Tarea no encontrada con id: " + id));

        existingTask.setTitle(taskRequest.title());
        existingTask.setDescription(taskRequest.description());
        existingTask.setDueDate(taskRequest.dueDate());
        existingTask.setCompleted(taskRequest.completed());

        Task updatedTask = taskRepository.save(existingTask);
        return taskMapper.toResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        Task task = taskRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new TaskNotFoundException("Tarea no encontrada con id: " + id));
        taskRepository.delete(task);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findTasksByEstado(boolean estado) {
        User currentUser = getCurrentUser();
        return taskRepository.findByCompletedAndUser(estado, currentUser).stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    // Método auxiliar para obtener el usuario autenticado
    private User getCurrentUser() {
        return (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }
}