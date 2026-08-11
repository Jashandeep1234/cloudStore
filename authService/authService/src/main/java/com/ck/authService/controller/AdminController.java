package com.ck.authService.controller;

import com.ck.authService.mapper.UserMapper;
import com.ck.authService.repository.UserRepository;
import com.ck.authService.response.ApiResponse;
import com.ck.authService.response.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin-only endpoints (ROLE_ADMIN required)")
public class AdminController {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @GetMapping("/users")
    @Operation(summary = "List all registered users (ADMIN only)")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        List<UserResponse> users = userRepository.findAll().stream()
                .map(userMapper::toResponse)
                .toList();
        return ResponseEntity.ok(ApiResponse.success("Users fetched successfully", users));
    }
}
