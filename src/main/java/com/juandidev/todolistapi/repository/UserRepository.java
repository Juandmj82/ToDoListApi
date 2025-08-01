package com.juandidev.todolistapi.repository;

import com.juandidev.todolistapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsernameNear(String username);

    //Hack: Para validar que no exista el usuario
    boolean existsByUsername(String username);

    // Hack: para validar que no exita el email
    boolean existsByEmail(String email);
}
