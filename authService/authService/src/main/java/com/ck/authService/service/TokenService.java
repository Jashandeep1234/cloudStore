package com.ck.authService.service;

import com.ck.authService.dto.TokenPair;
import com.ck.authService.entity.User;

public interface TokenService {

    TokenPair generateTokenPair(User user);

    String generateAccessToken(User user);

    String generateRefreshToken(User user);

    String extractEmail(String token);

    boolean isTokenValid(String token);
}
