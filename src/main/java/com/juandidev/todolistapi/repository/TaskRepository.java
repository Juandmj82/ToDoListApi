package com.juandidev.todolistapi.repository;

import com.juandidev.todolistapi.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository <Task, Long>{
    //métodos personalizados
    List<Task> findByEstado(boolean estado);
    List<Task> findByResponsable(String responsable);



}
