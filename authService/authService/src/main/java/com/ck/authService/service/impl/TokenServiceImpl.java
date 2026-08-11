package com.ck.authService.service.impl;

import com.ck.authService.dto.TokenPair;
import com.ck.authService.entity.User;
import com.ck.authService.jwt.JwtService;
import com.ck.authService.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenServiceImpl implements TokenService {

    private final JwtService jwtService;

    @Override
    public TokenPair generateTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return new TokenPair(accessToken, refreshToken, jwtService.getAccessTokenExpiration());
    }

    @Override
    public String generateAccessToken(User user) {
        return jwtService.generateAccessToken(user);
    }

    @Override
    public String generateRefreshToken(User user) {
        return jwtService.generateRefreshToken(user);
    }

    @Override
    public String extractEmail(String token) {
        return jwtService.extractEmail(token);
    }

    @Override
    public boolean isTokenValid(String token) {
        return jwtService.isTokenValid(token);
    }
}
