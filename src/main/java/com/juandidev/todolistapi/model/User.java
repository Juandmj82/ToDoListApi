package com.juandidev.todolistapi.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre de usuario no puede estar vacío")
    @Size(min = 3, max = 20, message = "El nombre de usuario debe tener entre 3 y 20 caracteres")
    @Column(nullable = false, unique = true)
    private String username;

    @NotBlank(message = "La contraseña no puede estar vacía")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{6,}$",
            message = "La contraseña debe contener al menos un número, una letra mayúscula, una minúscula y un carácter especial")
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "El email no puede estar vacío")
    @Email(message = "El formato del email no es válido")
    @Column(nullable = false, unique = true)
    private String email;


    // Define una colección de elementos básicos (en este caso, Strings)
// FetchType.EAGER = Los roles se cargan inmediatamente al cargar el usuario
    @ElementCollection(fetch = FetchType.EAGER)
// Crea una tabla separada 'user_roles' que se relaciona con 'usuarios' mediante 'user_id'
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
// El nombre de la columna en la tabla 'user_roles' que almacenará los roles
    @Column(name = "role")
    private List<String> roles = new ArrayList<>();

    // Establece una relación Uno a Muchos con la entidad Task
// mappedBy = El campo en la clase Task que mapea esta relación
// cascade = Las operaciones (persist, remove, etc.) se propagarán a las tareas relacionadas
// orphanRemoval = Si se elimina una tarea de esta lista, se eliminará de la base de datos
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();

    // Método auxiliar para agregar una tarea al usuario
// Mantiene la consistencia en ambos lados de la relación bidireccional
    public void addTask(Task task) {
        tasks.add(task);        // Agrega la tarea a la lista de tareas del usuario
        task.setUser(this);     // Establece este usuario como propietario de la tarea
    }

    // Método auxiliar para eliminar una tarea del usuario
// Mantiene la consistencia en ambos lados de la relación bidireccional
    public void removeTask(Task task) {
        tasks.remove(task);     // Elimina la tarea de la lista
        task.setUser(null);     // Elimina la referencia al usuario en la tarea
    }
}