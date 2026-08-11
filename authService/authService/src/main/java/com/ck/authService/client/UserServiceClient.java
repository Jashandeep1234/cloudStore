package com.ck.authService.client;

import com.ck.authService.config.AppProperties;
import com.ck.authService.response.UserResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

/**
 * HTTP client used to communicate with other internal microservices
 * (e.g. the user/drive service) once the request has been authenticated.
 */
@Component
public class UserServiceClient {

    private final RestClient restClient;

    public UserServiceClient(AppProperties appProperties) {
        this.restClient = RestClient.builder()
                .baseUrl(appProperties.services().userServiceUrl())
                .build();
    }

    public UserResponse getUserById(Long id) {
        return restClient.get()
                .uri("/api/users/{id}", id)
                .retrieve()
                .body(UserResponse.class);
    }
}
