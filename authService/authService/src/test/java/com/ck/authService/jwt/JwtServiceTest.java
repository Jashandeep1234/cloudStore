package com.ck.authService.jwt;

import com.ck.authService.config.JwtProperties;
import com.ck.authService.entity.Role;
import com.ck.authService.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtProperties props = new JwtProperties(
            "c2VjdXJlLXNlY3JldC1rZXktZm9yLWp3dC1zaWduaW5nLTI1Ni1iaXRzLW9r",
            900_000,
            604_800_000,
            "AUTHSERVICE");

    @Test
    void generatesAndParsesValidTokens() {
        JwtService jwtService = new JwtService(props);
        User user = User.builder()
                .id(1L)
                .email("test@example.com")
                .role(Role.USER)
                .build();

        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        assertNotNull(accessToken);
        assertNotNull(refreshToken);
        assertNotEquals(accessToken, refreshToken);
        assertEquals("test@example.com", jwtService.extractEmail(accessToken));
        assertTrue(jwtService.isTokenValid(accessToken));
        assertTrue(jwtService.isTokenValid(refreshToken));
    }
}
