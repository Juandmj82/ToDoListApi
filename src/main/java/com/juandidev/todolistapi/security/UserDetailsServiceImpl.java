package com.juandidev.todolistapi.security;

import com.juandidev.todolistapi.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Busca el usuario en la base de datos
        return userRepository.findByUsername(username)
                .map(UserDetailsImpl::build)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con nombre: " + username));
    }
}