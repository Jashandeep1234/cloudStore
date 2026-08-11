package com.ck.searchService.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Forwards the inbound Authorization header to downstream Feign calls so the
 * file/folder services can resolve the calling user.
 */
@Configuration
public class FeignAuthInterceptor {

    @Bean
    public RequestInterceptor authRequestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                var attrs = RequestContextHolder.getRequestAttributes();
                if (attrs instanceof ServletRequestAttributes sra) {
                    HttpServletRequest request = sra.getRequest();
                    String auth = request.getHeader("Authorization");
                    if (auth != null && !auth.isBlank()) {
                        template.header("Authorization", auth);
                    }
                }
            }
        };
    }
}
