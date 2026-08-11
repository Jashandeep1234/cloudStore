package com.ck.authService.mapper;

import com.ck.authService.entity.User;
import com.ck.authService.response.GoogleUserResponse;
import com.ck.authService.response.UserResponse;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .uuid(user.getUuid())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .provider(user.getProvider())
                .googleId(user.getGoogleId())
                .picture(user.getPicture())
                .enabled(user.isEnabled())
                .verified(user.isVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    public GoogleUserResponse toGoogleResponse(User user) {
        return GoogleUserResponse.builder()
                .googleId(user.getGoogleId())
                .email(user.getEmail())
                .name(user.getName())
                .picture(user.getPicture())
                .provider(user.getProvider())
                .build();
    }
}
