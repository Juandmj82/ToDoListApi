package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.RegisterRequest;
import com.juandidev.todolistapi.model.User;

public interface UserService {
    User registerNewUser(RegisterRequest registerRequest);
    User findByUsername(String username);
    User getCurrentUser();
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
