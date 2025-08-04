package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.RegisterRequest;
import com.juandidev.todolistapi.exception.ResourceAlreadyExistsException;
import com.juandidev.todolistapi.exception.ResourceNotFoundException;
import com.juandidev.todolistapi.model.User;
import com.juandidev.todolistapi.repository.UserRepository;
import com.juandidev.todolistapi.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User registerNewUser(RegisterRequest registerRequest) {
        // Verificar si el nombre de usuario ya existe
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new ResourceAlreadyExistsException("El nombre de usuario ya está en uso");
        }

        // Verificar si el correo electrónico ya existe
        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new ResourceAlreadyExistsException("El correo electrónico ya está en uso");
        }

        // Crear nuevo usuario
        User user = new User();
        user.setUsername(registerRequest.username());
        user.setEmail(registerRequest.email());
        user.setPassword(passwordEncoder.encode(registerRequest.password()));

        return userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con nombre de usuario: " + username));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResourceNotFoundException("No hay un usuario autenticado");
        }
        
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userDetails.getId()));
    }
}
