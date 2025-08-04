package com.juandidev.todolistapi.service;

import com.juandidev.todolistapi.dto.request.RegisterRequest;
import com.juandidev.todolistapi.dto.response.AuthResponse;

public interface IAuthService {
    AuthResponse register(RegisterRequest registerRequest);
}