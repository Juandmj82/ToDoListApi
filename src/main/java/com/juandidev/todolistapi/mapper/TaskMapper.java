package com.juandidev.todolistapi.mapper;

import com.juandidev.todolistapi.dto.response.TaskResponse;
import com.juandidev.todolistapi.dto.response.UserResponse;
import com.juandidev.todolistapi.model.Task;
import com.juandidev.todolistapi.model.User;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class TaskMapper {

    public TaskResponse toTaskResponse(Task task) {
        if (task == null) {
            return null;
        }

        UserResponse userResponse = null;
        if (task.getUser() != null) {
            User user = task.getUser();
            userResponse = new UserResponse(user.getId(), user.getUsername(), user.getEmail(), user.getCreatedAt());
        }

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getDueDate(),
                task.isCompleted(),
                task.getCreatedAt(),
                userResponse
        );
    }
}