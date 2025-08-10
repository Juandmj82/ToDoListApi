package com.juandidev.todolistapi.security;

import com.juandidev.todolistapi.security.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // Allow preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Public endpoints
                        .requestMatchers(
                            "/api/auth/**", 
                            "/api/users/check-username", 
                            "/api/users/check-email", 
                            "/v3/api-docs/**", 
                            "/swagger-ui/**",
                            "/swagger-ui.html"
                        ).permitAll()
                        // All other requests need to be authenticated
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins in development (restrict in production)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://127.0.0.1:*", 
            "http://localhost:*",
            "http://localhost",
            "http://127.0.0.1",
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://tareas-puce.vercel.app",
            "file://*"
        ));
        
        // Allow all necessary methods
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Allow all headers that might be sent by the frontend
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "X-Requested-With",
            "Cache-Control"
        ));
        
        // Allow credentials (cookies, HTTP authentication)
        configuration.setAllowCredentials(true);
        
        // Cache preflight requests for 1 hour
        configuration.setMaxAge(3600L);
        
        // Expose necessary headers to the frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Disposition"
        ));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}