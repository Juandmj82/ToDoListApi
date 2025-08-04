package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.RegisterRequest;
import com.juandidev.todolistapi.dto.response.AuthResponse;
import com.juandidev.todolistapi.model.User;
import com.juandidev.todolistapi.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements IAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest registerRequest) {
        // Validación para evitar usuarios duplicados
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new RuntimeException("El nombre de usuario ya está en uso");
        }
        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new RuntimeException("El email ya está en uso");
        }

        // Crear el nuevo usuario
        User user = new User();
        user.setUsername(registerRequest.username());
        user.setEmail(registerRequest.email());
        user.setPassword(passwordEncoder.encode(registerRequest.password()));

        // Guardar el usuario en la base de datos
        User savedUser = userRepository.save(user);

        // Por ahora, solo devolveremos el nombre de usuario y un token de prueba.
        // La lógica real para JWT se añadirá más adelante.
        return new AuthResponse(savedUser.getUsername(), "token_de_prueba");
    }
}