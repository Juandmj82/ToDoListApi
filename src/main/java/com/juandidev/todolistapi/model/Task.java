package com.juandidev.todolistapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "tareas")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El título de la tarea no puede estar vacío")
    @Size(max = 100, message = "El título no puede tener más de 100 caracteres")
    @Column(nullable = false, length = 100)
    private String title;

    @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    @Column(length = 500)
    private String description;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    @Future(message = "La fecha de vencimiento debe ser futura")
    @Column(nullable = false)
    private LocalDate dueDate;

    @Column(nullable = false)
    private boolean completed = false;

    // Relación Many-to-One con User
    // Muchas tareas pueden pertenecer a un usuario
    @ManyToOne(fetch = FetchType.LAZY)  // Carga perezosa para optimizar rendimiento
    @JoinColumn(name = "user_id", nullable = false)  // Nombre de la columna en la tabla tareas
    private User user;  // Referencia al usuario propietario de la tarea
}