package com.ck.authService.security;

import com.ck.authService.entity.Provider;
import com.ck.authService.entity.Role;
import com.ck.authService.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String uuid;
    private final String email;
    private final String password;
    private final String name;
    private final Role role;
    private final Provider provider;
    private final boolean enabled;
    private final boolean verified;

    private UserPrincipal(Long id, String uuid, String email, String password, String name,
                          Role role, Provider provider, boolean enabled, boolean verified) {
        this.id = id;
        this.uuid = uuid;
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role;
        this.provider = provider;
        this.enabled = enabled;
        this.verified = verified;
    }

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getUuid(),
                user.getEmail(),
                user.getPassword(),
                user.getName(),
                user.getRole(),
                user.getProvider(),
                user.isEnabled(),
                user.isVerified());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}
