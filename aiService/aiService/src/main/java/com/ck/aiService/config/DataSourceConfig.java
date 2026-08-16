package com.ck.aiService.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Value("${DB_URL:}")
    private String rawDbUrl;

    @Value("${DB_USERNAME:}")
    private String username;

    @Value("${DB_PASSWORD:}")
    private String password;

    @Bean
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        config.setDriverClassName("org.postgresql.Driver");
        config.setJdbcUrl(normalizeUrl(rawDbUrl));
        config.setUsername(username);
        config.setPassword(password);
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(300000);
        config.setMaxLifetime(600000);
        config.setConnectionTimeout(30000);
        config.setKeepaliveTime(60000);
        config.setLeakDetectionThreshold(60000);
        return new HikariDataSource(config);
    }

    private String normalizeUrl(String url) {
        if (url == null) {
            return url;
        }
        String trimmed = url.trim();
        // Remove stray leading colons (e.g. ":jdbc:postgresql://...")
        while (trimmed.startsWith(":")) {
            trimmed = trimmed.substring(1);
        }
        // Accept both libpq (postgres://... / postgresql://...) and JDBC formats.
        if (trimmed.startsWith("jdbc:postgres")) {
            return trimmed;
        }
        if (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://")) {
            return "jdbc:" + trimmed;
        }
        return "jdbc:" + trimmed;
    }
}
