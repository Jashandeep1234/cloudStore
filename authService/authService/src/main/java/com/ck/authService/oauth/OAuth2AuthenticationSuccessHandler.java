package com.ck.authService.oauth;

import com.ck.authService.config.AppProperties;
import com.ck.authService.dto.TokenPair;
import com.ck.authService.entity.User;
import com.ck.authService.service.RefreshTokenService;
import com.ck.authService.service.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final TokenService tokenService;
    private final RefreshTokenService refreshTokenService;
    private final AppProperties appProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2UserPrincipal principal = (OAuth2UserPrincipal) authentication.getPrincipal();
        User user = principal.getUser();

        TokenPair tokenPair = tokenService.generateTokenPair(user);
        refreshTokenService.createRefreshToken(user, tokenPair.refreshToken());

        String targetUrl = UriComponentsBuilder
                .fromUriString(appProperties.oauth2().redirectUri())
                .queryParam("accessToken", tokenPair.accessToken())
                .queryParam("refreshToken", tokenPair.refreshToken())
                .queryParam("expiresIn", tokenPair.expiresIn())
                .build()
                .toUriString();

        if (response.isCommitted()) {
            log.debug("Response has already been committed. Unable to redirect to {}", targetUrl);
            return;
        }

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
