package com.ck.folderService.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Extracts the authenticated user's ID from the JWT access token
 * sent in the Authorization header.
 */
@Component
public class JwtUtil {

    private final SecretKey signingKey;

    public JwtUtil(@Value("${app.jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Returns the userId claim from the Bearer token in the request header,
     * or null when the header is missing/invalid.
     */
    public Long getUserId(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            return null;
        }
        String token = header.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Object userId = claims.get("userId");
            if (userId instanceof Number n) {
                return n.longValue();
            }
            if (userId != null) {
                return Long.parseLong(userId.toString());
            }
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
        return null;
    }
}
