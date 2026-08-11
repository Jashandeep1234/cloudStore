package com.ck.aiService.util;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class TextExtractor {

    private static final Logger log = LoggerFactory.getLogger(TextExtractor.class);

    public String extractTextFromInputStream(InputStream inputStream) {
        try {
            StringBuilder text = new StringBuilder();
            BufferedReader reader = new BufferedReader(
                new InputStreamReader(inputStream, StandardCharsets.UTF_8)
            );
            String line;
            while ((line = reader.readLine()) != null) {
                text.append(line).append("\n");
            }
            return text.toString().trim();
        } catch (Exception e) {
            log.error("Error extracting text from input stream", e);
            return "";
        }
    }

    public String extractTextFromInputStream(InputStream inputStream, long maxLength) {
        String text = extractTextFromInputStream(inputStream);
        if (text.length() > maxLength) {
            return text.substring(0, (int) maxLength);
        }
        return text;
    }
}
