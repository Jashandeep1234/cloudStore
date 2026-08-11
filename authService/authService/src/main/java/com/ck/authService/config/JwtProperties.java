package com.ck.authService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * JWT configuration bound from the {@code app.jwt.*} properties.
 */
@ConfigurationProperties(prefix = "app.jwt")
public record JwtProperties(
        String secret,
        long accessTokenExpiration,
        long refreshTokenExpiration,
        String issuer
) {
}
