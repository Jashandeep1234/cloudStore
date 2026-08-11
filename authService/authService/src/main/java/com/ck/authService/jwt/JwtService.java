package com.ck.authService.jwt;

import com.ck.authService.config.JwtProperties;
import com.ck.authService.entity.User;
import com.ck.authService.exception.ExpiredTokenException;
import com.ck.authService.exception.InvalidTokenException;
import com.ck.authService.exception.TokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

/**
 * Low-level JWT utility. Creates and parses signed HS256 access/refresh tokens.
 */
@Component
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    private final JwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(jwtProperties.issuer())
                .subject(user.getEmail())
                .id(UUID.randomUUID().toString())
                .claim("type", "access")
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(jwtProperties.accessTokenExpiration())))
                .signWith(signingKey)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(jwtProperties.issuer())
                .subject(user.getEmail())
                .id(UUID.randomUUID().toString())
                .claim("type", "refresh")
                .claim("userId", user.getId())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(jwtProperties.refreshTokenExpiration())))
                .signWith(signingKey)
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            return claims.getExpiration() == null || claims.getExpiration().after(new Date());
        } catch (TokenException ex) {
            return false;
        }
    }

    public long getAccessTokenExpiration() {
        return jwtProperties.accessTokenExpiration();
    }

    public long getRefreshTokenExpiration() {
        return jwtProperties.refreshTokenExpiration();
    }

    public Claims parseClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException ex) {
            throw new ExpiredTokenException("JWT token has expired", ex);
        } catch (JwtException | IllegalArgumentException ex) {
            throw new InvalidTokenException("Invalid JWT token", ex);
        }
    }
}
