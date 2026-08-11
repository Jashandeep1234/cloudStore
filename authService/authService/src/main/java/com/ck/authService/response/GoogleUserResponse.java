package com.ck.authService.response;

import com.ck.authService.entity.Provider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserResponse {

    private String googleId;
    private String email;
    private String name;
    private String picture;
    private Provider provider;
}
