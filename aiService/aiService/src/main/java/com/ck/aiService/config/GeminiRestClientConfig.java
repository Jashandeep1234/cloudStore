package com.ck.aiService.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class GeminiRestClientConfig {

    @Value("${gemini.api.timeout:60000}")
    private int timeout;

    /**
     * Dedicated RestTemplate for Gemini API calls.
     *
     * This bean intentionally has NO interceptor, so the user's JWT
     * (Authorization header) is never forwarded to Google's Gemini API,
     * which rejects non-Google Bearer tokens with HTTP 401.
     */
    @Bean
    public RestTemplate geminiRestTemplate() {
        return new RestTemplate();
    }
}