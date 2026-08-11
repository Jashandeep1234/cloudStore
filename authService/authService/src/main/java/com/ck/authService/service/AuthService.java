package com.ck.authService.service;

import com.ck.authService.request.LoginRequest;
import com.ck.authService.request.RefreshRequest;
import com.ck.authService.request.RegisterRequest;
import com.ck.authService.response.AuthResponse;
import com.ck.authService.response.UserResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshRequest request);

    void logout(String refreshToken);

    UserResponse getCurrentUser();
}
