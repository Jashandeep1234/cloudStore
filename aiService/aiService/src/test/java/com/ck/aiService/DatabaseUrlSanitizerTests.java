package com.ck.aiService;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class DatabaseUrlSanitizerTests {

    @Test
    void testNullUrl() {
        assertNull(AiServiceApplication.sanitizeUrl(null));
    }

    @Test
    void testStandardUrl() {
        String url = "jdbc:postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require";
        assertEquals(url, AiServiceApplication.sanitizeUrl(url));
    }

    @Test
    void testLeadingColon() {
        String input = ":jdbc:postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require";
        String expected = "jdbc:postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb?sslmode=require";
        assertEquals(expected, AiServiceApplication.sanitizeUrl(input));
    }

    @Test
    void testMultipleLeadingColonsAndWhitespace() {
        String input = "  ::jdbc:postgresql://localhost:5432/db  ";
        String expected = "jdbc:postgresql://localhost:5432/db";
        assertEquals(expected, AiServiceApplication.sanitizeUrl(input));
    }

    @Test
    void testPostgresqlPrefixOnly() {
        String input = "postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb";
        String expected = "jdbc:postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb";
        assertEquals(expected, AiServiceApplication.sanitizeUrl(input));
    }

    @Test
    void testPostgresPrefixOnly() {
        String input = "postgres://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb";
        String expected = "jdbc:postgresql://ep-sweet-wind-azvc4o9j.c-3.ap-southeast-1.aws.neon.tech:5432/neondb";
        assertEquals(expected, AiServiceApplication.sanitizeUrl(input));
    }
}
