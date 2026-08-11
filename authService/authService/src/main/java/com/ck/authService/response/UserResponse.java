package com.ck.authService.response;

import com.ck.authService.entity.Provider;
import com.ck.authService.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String uuid;
    private String name;
    private String email;
    private Role role;
    private Provider provider;
    private String googleId;
    private String picture;
    private boolean enabled;
    private boolean verified;
    private Instant createdAt;
    private Instant updatedAt;
}
