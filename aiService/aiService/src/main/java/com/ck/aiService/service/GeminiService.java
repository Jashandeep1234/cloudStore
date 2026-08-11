package com.ck.aiService.service;

import com.ck.aiService.config.GeminiConfig;
import com.ck.aiService.exception.GeminiApiException;
import com.ck.aiService.model.FileSummary;
import com.ck.aiService.repository.FileSummaryRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);
    private static final String GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

    private final GeminiConfig geminiConfig;
    private final RestTemplate restTemplate;  // ✅ Changed from RestClient
    private final FileSummaryRepository fileSummaryRepository;
    private final ConversationService conversationService;

    // ✅ Updated constructor
    public GeminiService(GeminiConfig geminiConfig,
                         @Qualifier("geminiRestTemplate") RestTemplate geminiRestTemplate,  // ✅ Dedicated no-interceptor bean
                         FileSummaryRepository fileSummaryRepository,
                         ConversationService conversationService) {
        this.geminiConfig = geminiConfig;
        this.restTemplate = geminiRestTemplate;  // ✅ Use RestTemplate
        this.fileSummaryRepository = fileSummaryRepository;
        this.conversationService = conversationService;
    }

    public String generateText(String prompt) {
        return callGeminiApi(geminiConfig.getModel(), buildTextRequest(prompt));
    }

    public String generateSummary(String fileContent, String fileType) {
        String prompt = buildSummaryPrompt(fileContent, fileType);
        return callGeminiApi(geminiConfig.getModel(), buildTextRequest(prompt));
    }

    public String generateSummaryWithCaching(Long fileId, String fileContent, String fileType) {
        if (fileId != null) {
            Optional<FileSummary> cached = fileSummaryRepository.findByFileId(fileId);
            if (cached.isPresent()) {
                log.info("Returning cached summary for fileId: {}", fileId);
                return cached.get().getSummary();
            }
        }

        String summary = generateSummary(fileContent, fileType);

        if (fileId != null) {
            FileSummary fileSummary = new FileSummary();
            fileSummary.setFileId(fileId);
            fileSummary.setSummary(summary);
            fileSummary.setModelUsed(geminiConfig.getModel());
            fileSummary.setFileType(fileType);
            fileSummaryRepository.save(fileSummary);
            log.info("Cached summary for fileId: {}", fileId);
        }

        return summary;
    }

    public String askQuestion(String question, String conversationId) {
        String context = conversationService.getFormattedHistory(conversationId);
        String storedContext = conversationService.getContext(conversationId);

        StringBuilder prompt = new StringBuilder();
        if (storedContext != null && !storedContext.isBlank()) {
            prompt.append("Folder/document context provided at conversation start:\n")
                .append(storedContext)
                .append("\n\n");
        }
        if (!context.isEmpty()) {
            prompt.append("Conversation history:\n").append(context).append("\n\n");
        }
        prompt.append("User question: ").append(question);

        String response = callGeminiApi(geminiConfig.getModel(), buildTextRequest(prompt.toString()));

        conversationService.addMessageToConversation(conversationId, question, response);

        return response;
    }

    public String analyzePDF(String fileContent, String fileName) {
        String prompt = "Analyze the following PDF document content from file '" + fileName + "'. "
                + "Provide a comprehensive summary including key topics, main points, and important details:\n\n"
                + fileContent;
        return callGeminiApi(geminiConfig.getModel(), buildTextRequest(prompt));
    }

    public String analyzeImage(String base64Image, String mimeType) {
        return callGeminiApi(geminiConfig.getVisionModel(), buildVisionRequest(base64Image, mimeType));
    }

    public String analyzeFile(String fileContent, String fileName, String fileType) {
        String prompt = String.format(
            "Analyze the following %s file '%s'. Provide a comprehensive summary including:\n"
            + "1. Key topics and main points\n"
            + "2. Important data or findings\n"
            + "3. Overall structure and content overview\n\n"
            + "File content:\n%s",
            fileType.toUpperCase(), fileName, fileContent
        );
        return callGeminiApi(geminiConfig.getModel(), buildTextRequest(prompt));
    }

    public String getConversationContext(String conversationId) {
        return conversationService.getFormattedHistory(conversationId);
    }

    private String callGeminiApi(String model, Map<String, Object> requestBody) {
        try {
            log.debug("Calling Gemini API with model: {}", model);

            String url = String.format(
                    "%s/%s:generateContent?key=%s",
                    GEMINI_API_BASE,
                    model,
                    geminiConfig.getApiKey()
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                Map.class
            );

            return extractResponseText(response.getBody());

        } catch (Exception e) {
            log.error("Gemini API call failed for model: {}", model);
            log.error("Error details: {}", e.getMessage());
            throw new GeminiApiException("Failed to get response from Gemini API: " + e.getMessage(), e);
        }
    }

    private String extractResponseText(Map<String, Object> response) {
        if (response == null) {
            throw new GeminiApiException("Empty response from Gemini API");
        }

        try {
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                Map<String, Object> error = (Map<String, Object>) response.get("error");
                if (error != null) {
                    throw new GeminiApiException(
                        "Gemini API error: " + error.get("message"),
                        (int) error.getOrDefault("code", 500)
                    );
                }
                throw new GeminiApiException("No candidates returned from Gemini API");
            }

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            if (content == null) {
                throw new GeminiApiException("No content in Gemini API response");
            }

            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                throw new GeminiApiException("No parts in Gemini API response");
            }

            StringBuilder fullText = new StringBuilder();
            for (Map<String, Object> part : parts) {
                String text = (String) part.get("text");
                if (text != null) {
                    fullText.append(text);
                }
            }

            String result = fullText.toString().trim();
            if (result.isEmpty()) {
                throw new GeminiApiException("Empty text in Gemini API response");
            }

            return result;
        } catch (GeminiApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini API response: {}", response, e);
            throw new GeminiApiException("Failed to parse Gemini API response", e);
        }
    }

    private Map<String, Object> buildTextRequest(String prompt) {
        return Map.of(
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(
                        Map.of("text", prompt)
                    )
                )
            ),
            "generationConfig", Map.of(
                "maxOutputTokens", geminiConfig.getMaxTokens(),
                "temperature", geminiConfig.getTemperature()
            )
        );
    }

    private Map<String, Object> buildVisionRequest(String base64Image, String mimeType) {
        return Map.of(
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(
                        Map.of("text", "Analyze this image in detail. Describe what you see, identify any text, objects, people, or notable elements."),
                        Map.of(
                            "inlineData", Map.of(
                                "mimeType", mimeType,
                                "data", base64Image
                            )
                        )
                    )
                )
            ),
            "generationConfig", Map.of(
                "maxOutputTokens", geminiConfig.getMaxTokens(),
                "temperature", geminiConfig.getTemperature()
            )
        );
    }

    private String buildSummaryPrompt(String fileContent, String fileType) {
        return String.format(
            "Please analyze the following %s content and provide a concise but comprehensive summary. "
            + "Include key points, main topics, important data, and actionable insights:\n\n%s",
            fileType != null ? fileType.toUpperCase() : "document",
            fileContent.length() > 30000 ? fileContent.substring(0, 30000) : fileContent
        );
    }
}
