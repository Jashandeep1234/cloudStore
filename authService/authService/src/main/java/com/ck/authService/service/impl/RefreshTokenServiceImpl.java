package com.ck.authService.service.impl;

import com.ck.authService.entity.RefreshToken;
import com.ck.authService.entity.User;
import com.ck.authService.exception.ExpiredTokenException;
import com.ck.authService.exception.InvalidTokenException;
import com.ck.authService.repository.RefreshTokenRepository;
import com.ck.authService.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final com.ck.authService.config.JwtProperties jwtProperties;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now().plusMillis(jwtProperties.refreshTokenExpiration()))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken verify(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Refresh token not found. Please login again."));

        if (refreshToken.isRevoked()) {
            throw new InvalidTokenException("Refresh token has been revoked. Please login again.");
        }
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new ExpiredTokenException("Refresh token has expired. Please login again.");
        }
        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshToken -> {
                    refreshToken.setRevoked(true);
                    refreshTokenRepository.save(refreshToken);
                });
    }
}
