package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.TaskRequest;
import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.exception.TaskNotFoundException;
import com.juandidev.todolistapi.mapper.TaskMapper;
import com.juandidev.todolistapi.model.Task;
import com.juandidev.todolistapi.repository.TaskRepository;
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
        return taskRepository.findAll().stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TaskResponse> findTaskById(Long id) {
        return taskRepository.findById(id)
                .map(taskMapper::toResponse);
    }
    @Override
    @Transactional
    public TaskResponse createTask(TaskRequest taskRequest) {
        Task task = taskMapper.toEntity(taskRequest);
        Task savedTask = taskRepository.save(task);
        return taskMapper.toResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long id, TaskRequest taskRequest) {
        Task existingTask = taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException("Tarea no encontrada con id: " + id));

        existingTask.setTitulo(taskRequest.titulo());
        existingTask.setDescripcion(taskRequest.descripcion());
        existingTask.setResponsable(taskRequest.responsable());
        existingTask.setFechaEntrega(taskRequest.fechaEntrega());
        existingTask.setEstado(taskRequest.estado());


        Task updatedTask = taskRepository.save(existingTask);
        return taskMapper.toResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long id) {
        if (!taskRepository.existsById(id)) {
            throw new TaskNotFoundException("Tarea no encontrada con id: " + id);
        }
        taskRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findTasksByEstado(boolean estado) {
        return taskRepository.findByEstado(estado).stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponse> findTasksByResponsable(String responsable) {
        return taskRepository.findByResponsable(responsable).stream()
                .map(taskMapper::toResponse)
                .collect(Collectors.toList());
    }
}