package com.ck.aiService.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.client.ClientHttpRequestInterceptor;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
public class WebConfig {

    // CORS is handled by the API Gateway (GatewayCorsConfig). This service only
    // receives traffic through the gateway, so it must NOT add its own
    // Access-Control-Allow-Origin header — doing so produced duplicate CORS
    // headers that browsers reject.
    @Bean
    @Primary
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        // Forward the inbound user's Bearer token to downstream services
        // (file/folder services) so per-user data isolation is preserved.
        restTemplate.setInterceptors(java.util.List.of(
            (ClientHttpRequestInterceptor) (request, body, execution) -> {
                var attrs = RequestContextHolder.getRequestAttributes();
                if (attrs instanceof ServletRequestAttributes sra) {
                    HttpServletRequest httpRequest = sra.getRequest();
                    String auth = httpRequest.getHeader("Authorization");
                    if (auth != null && !auth.isBlank()) {
                        request.getHeaders().set("Authorization", auth);
                    }
                }
                return execution.execute(request, body);
            }
        ));
        return restTemplate;
    }
}
