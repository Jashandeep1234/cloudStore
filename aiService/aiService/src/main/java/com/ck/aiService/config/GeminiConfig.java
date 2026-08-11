package com.ck.aiService.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class GeminiConfig {


    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.vision-model}")
    private String visionModel;

    @Value("${gemini.api.timeout:60000}")
    private int timeout;

    @Value("${gemini.api.max-tokens:2048}")
    private int maxTokens;

    @Value("${gemini.api.temperature:0.7}")
    private double temperature;

    // Getters
    public String getApiKey() {
        return apiKey;
    }

    public String getModel() {
        return model;
    }

    public String getVisionModel() {
        return visionModel;
    }

    public int getTimeout() {
        return timeout;
    }

    public int getMaxTokens() {
        return maxTokens;
    }

    public double getTemperature() {
        return temperature;
    }
}
