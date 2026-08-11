package com.ck.authService.dto;

/**
 * Internal service-layer DTO holding a freshly generated access/refresh token pair.
 */
public record TokenPair(String accessToken, String refreshToken, long expiresIn) {
}
