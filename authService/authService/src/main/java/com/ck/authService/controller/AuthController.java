package com.ck.authService.controller;

import com.ck.authService.request.LoginRequest;
import com.ck.authService.request.RefreshRequest;
import com.ck.authService.request.RegisterRequest;
import com.ck.authService.response.ApiResponse;
import com.ck.authService.response.AuthResponse;
import com.ck.authService.response.UserResponse;
import com.ck.authService.service.AuthService;
import com.ck.authService.util.CookieUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.util.StringUtils;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "JWT and Google OAuth2 authentication endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new user (email + password)")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User registered successfully", authService.register(request)));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate the refresh token and issue a new access token")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Token refreshed successfully", authService.refresh(request)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout and revoke the refresh token (blacklist)")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestBody(required = false) RefreshRequest request,
                                                    @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorization,
                                                    HttpServletResponse response) {
        String refreshToken = request != null ? request.getRefreshToken() : null;
        if (!StringUtils.hasText(refreshToken) && StringUtils.hasText(authorization) && authorization.startsWith("Bearer ")) {
            refreshToken = authorization.substring(7);
        }
        authService.logout(refreshToken);
        CookieUtils.deleteCookie(response, "refresh_token");
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully"));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get the currently authenticated user")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.success("Current user fetched successfully", authService.getCurrentUser()));
    }

    @GetMapping("/google")
    @Operation(summary = "Initiate Google OAuth2 login (redirects to /oauth2/authorization/google)")
    public ResponseEntity<Void> googleLogin() {
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create("/oauth2/authorization/google"))
                .build();
    }
}
