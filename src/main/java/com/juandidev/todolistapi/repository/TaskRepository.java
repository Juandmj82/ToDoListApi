package com.juandidev.todolistapi.repository;

import com.juandidev.todolistapi.model.Task;
import com.juandidev.todolistapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    // Obtener todas las tareas de un usuario
    List<Task> findByUser(User user);

    // Obtener una tarea por ID que pertenezca a un usuario específico
    Optional<Task> findByIdAndUser(Long id, User user);

    // Obtener tareas por estado (completadas o no) de un usuario específico
    List<Task> findByCompletedAndUser(boolean completed, User user);
}