package com.ck.authService.service;

import com.ck.authService.entity.RefreshToken;
import com.ck.authService.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user, String token);

    RefreshToken verify(String token);

    void revokeToken(String token);
}
