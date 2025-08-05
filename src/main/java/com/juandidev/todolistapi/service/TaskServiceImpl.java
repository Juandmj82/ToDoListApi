package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.TaskRequest;
import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.dto.response.UserResponse;
import com.juandidev.todolistapi.model.Task;
import com.juandidev.todolistapi.model.User;
import com.juandidev.todolistapi.repository.TaskRepository;
import com.juandidev.todolistapi.repository.UserRepository;
import com.juandidev.todolistapi.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements ITaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Autowired
    public TaskServiceImpl(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<TaskResponse> findAllTasks() {
        User currentUser = getCurrentUser();
        return taskRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<TaskResponse> findTaskById(Long id) {
        User currentUser = getCurrentUser();
        return taskRepository.findByIdAndUser(id, currentUser)
                .map(this::toTaskResponse);
    }

    @Override
    public TaskResponse createTask(TaskRequest taskRequest) {
        User currentUser = getCurrentUser();
        Task task = new Task();
        task.setTitle(taskRequest.title());
        task.setDescription(taskRequest.description());
        task.setDueDate(taskRequest.dueDate());
        task.setCompleted(false);
        task.setUser(currentUser);

        Task savedTask = taskRepository.save(task);

        return toTaskResponse(savedTask);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        User currentUser = getCurrentUser();

        return taskRepository.findByIdAndUser(id, currentUser)
                .map(task -> {
                    task.setTitle(taskRequest.title());
                    task.setDescription(taskRequest.description());
                    task.setDueDate(taskRequest.dueDate());
                    task.setCompleted(taskRequest.completed());
                    Task updatedTask = taskRepository.save(task);
                    return toTaskResponse(updatedTask);
                })
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada o no pertenece al usuario autenticado."));
    }

    @Override
    public void deleteTask(Long id) {
        User currentUser = getCurrentUser();
        // 1. Busca la tarea por su ID y el usuario
        //    Esto asegura que solo se pueda eliminar las tareas del usuario autenticado
        Task taskToDelete = taskRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new IllegalArgumentException("Tarea no encontrada o no pertenece al usuario autenticado."));

        // 2. Elimina la tarea de la base de datos
        taskRepository.delete(taskToDelete);
    }

    @Override
    public List<TaskResponse> findTasksByEstado(boolean estado) {
        User currentUser = getCurrentUser();
        return taskRepository.findByCompletedAndUser(estado, currentUser)
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof UserDetailsImpl) {
            String username = ((UserDetailsImpl) principal).getUsername();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado en la base de datos."));
        } else {
            throw new IllegalStateException("Usuario no autenticado o tipo de principal inesperado.");
        }
    }

    private TaskResponse toTaskResponse(Task task) {
        UserResponse userResponse = null;
        if (task.getUser() != null) {
            User user = task.getUser();
            userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getCreatedAt());
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.isCompleted(),
                task.getCreatedAt(),
                userResponse
        );
    }
}