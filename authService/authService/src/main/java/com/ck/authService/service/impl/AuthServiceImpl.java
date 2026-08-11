package com.ck.authService.service.impl;

import com.ck.authService.dto.TokenPair;
import com.ck.authService.entity.Provider;
import com.ck.authService.entity.RefreshToken;
import com.ck.authService.entity.Role;
import com.ck.authService.entity.User;
import com.ck.authService.exception.DuplicateEmailException;
import com.ck.authService.exception.UserNotFoundException;
import com.ck.authService.mapper.UserMapper;
import com.ck.authService.repository.RefreshTokenRepository;
import com.ck.authService.repository.UserRepository;
import com.ck.authService.request.LoginRequest;
import com.ck.authService.request.RefreshRequest;
import com.ck.authService.request.RegisterRequest;
import com.ck.authService.response.AuthResponse;
import com.ck.authService.response.UserResponse;
import com.ck.authService.security.SecurityUtils;
import com.ck.authService.service.AuthService;
import com.ck.authService.service.RefreshTokenService;
import com.ck.authService.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException("An account with email " + email + " already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .provider(Provider.LOCAL)
                .role(Role.USER)
                .enabled(true)
                .verified(false)
                .build();
        user = userRepository.save(user);

        log.info("New local user registered: {}", email);
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (user.getProvider() != Provider.LOCAL) {
            throw new BadCredentialsException(
                    "This account was created using " + user.getProvider() + ". Please sign in using Google.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), request.getPassword()));

        log.info("Local user logged in: {}", email);
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken storedToken = refreshTokenService.verify(request.getRefreshToken());
        User user = storedToken.getUser();

        // Token rotation: revoke the old refresh token, issue a brand new pair.
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        log.info("Refresh token rotated for user: {}", user.getEmail());
        return buildAuthResponse(user);
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revokeToken(refreshToken);
            log.info("Refresh token revoked on logout");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));
        return userMapper.toResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        TokenPair tokenPair = tokenService.generateTokenPair(user);
        refreshTokenService.createRefreshToken(user, tokenPair.refreshToken());

        return AuthResponse.builder()
                .accessToken(tokenPair.accessToken())
                .refreshToken(tokenPair.refreshToken())
                .tokenType("Bearer")
                .expiresIn(tokenPair.expiresIn())
                .user(userMapper.toResponse(user))
                .build();
    }
}
