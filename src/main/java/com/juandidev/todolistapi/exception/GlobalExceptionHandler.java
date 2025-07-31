package com.juandidev.todolistapi.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {


    @ExceptionHandler(TaskNotFoundException.class)
    public ResponseEntity<String> handleTaskNotFoundException(TaskNotFoundException ex) {
        return ResponseEntity.notFound().build();
    }
}
