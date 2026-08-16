package com.ck.aiService;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableCaching
@EnableDiscoveryClient
public class AiServiceApplication {

    public static void main(String[] args) {
        System.out.println("==================================");
        System.out.println("ENV DB_URL = [" + System.getenv("DB_URL") + "]");
        System.out.println("==================================");
        SpringApplication.run(AiServiceApplication.class, args);
    }
}
