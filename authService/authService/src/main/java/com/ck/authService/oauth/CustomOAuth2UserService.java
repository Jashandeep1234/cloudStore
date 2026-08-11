package com.ck.authService.oauth;

import com.ck.authService.entity.Provider;
import com.ck.authService.entity.Role;
import com.ck.authService.entity.User;
import com.ck.authService.exception.OAuth2AuthenticationProcessingException;
import com.ck.authService.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger log = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuth2User(oAuth2User);
    }

    private OAuth2User processOAuth2User(OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        String email = (String) attributes.get("email");
        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        String googleId = String.valueOf(attributes.get("sub"));
        String name = (String) attributes.get("name");
        String picture = (String) attributes.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> registerNewUser(email, googleId, name, picture));

        if (user.getProvider() != Provider.GOOGLE) {
            throw new OAuth2AuthenticationProcessingException(
                    "An account with email " + email + " already exists. Please sign in with email and password.");
        }

        user.setGoogleId(googleId);
        user.setName(name);
        user.setPicture(picture);
        user.setVerified(true);
        user.setEnabled(true);
        user = userRepository.save(user);

        log.info("Google user authenticated: {}", email);
        return OAuth2UserPrincipal.create(user, attributes);
    }

    private User registerNewUser(String email, String googleId, String name, String picture) {
        return User.builder()
                .name(name == null ? email : name)
                .email(email)
                .provider(Provider.GOOGLE)
                .googleId(googleId)
                .picture(picture)
                .role(Role.USER)
                .enabled(true)
                .verified(true)
                .build();
    }
}
