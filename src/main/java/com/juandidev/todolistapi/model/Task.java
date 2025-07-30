package com.juandidev.todolistapi.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tareas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El titulo no puede estar vacio")
    @Column(nullable = false)
    private String titulo;

    @NotBlank(message = "La descripción no puede estar vacía")
    @Size(max = 500, message = "La descripción no puede tener más de 500 caracteres")
    private String descripcion;

    @NotBlank(message = "El responsable no puede estar vacío")
    @Column(nullable = false)
    private String responsable;

    @Future(message = "La fecha de entrega debe ser igual o posterior a la fecha actual")
    @Column(nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    private LocalDate fechaEntrega;

    @Column(nullable = false)
    private boolean estado = false;



}
