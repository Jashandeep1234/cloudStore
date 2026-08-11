package com.ck.authService.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

/**
 * Application-level configuration bound from the {@code app.*} properties.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        OAuth2 oauth2,
        Cors cors,
        Services services
) {
    public record OAuth2(String redirectUri, String failureRedirectUri) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Services(String userServiceUrl) {
    }
}
