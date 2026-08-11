package com.ck.aiService.controller;

import com.ck.aiService.dto.ConversationResponseDTO;
import com.ck.aiService.dto.CreateConversationRequestDTO;
import com.ck.aiService.dto.MessageRequestDTO;
import com.ck.aiService.exception.ConversationNotFoundException;
import com.ck.aiService.model.Conversation;
import com.ck.aiService.model.Message;
import com.ck.aiService.service.ConversationService;
import com.ck.aiService.service.FolderAnalysisService;
import com.ck.aiService.service.GeminiService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private static final Logger log = LoggerFactory.getLogger(ConversationController.class);

    private final ConversationService conversationService;
    private final FolderAnalysisService folderAnalysisService;
    private final GeminiService geminiService;

    public ConversationController(ConversationService conversationService,
                                  FolderAnalysisService folderAnalysisService,
                                  GeminiService geminiService) {
        this.conversationService = conversationService;
        this.folderAnalysisService = folderAnalysisService;
        this.geminiService = geminiService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createConversation(
            @Valid @RequestBody CreateConversationRequestDTO request) {

        Conversation conversation = conversationService.createConversation(
            request.getUserId(),
            request.getFileIds(),
            request.getFolderId(),
            request.getTitle()
        );

        String context = null;
        if (request.getFolderId() != null) {
            log.info("Building folder architecture context for folder: {}", request.getFolderId());
            try {
                context = folderAnalysisService.buildFolderContext(request.getFolderId());
                conversationService.updateContext(conversation.getId().toString(), context);
            } catch (Exception e) {
                log.error("Failed to build folder context for folder: {}", request.getFolderId(), e);
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("conversationId", conversation.getId());
        response.put("userId", conversation.getUserId());
        response.put("folderId", conversation.getFolderId());
        response.put("title", conversation.getTitle());
        response.put("status", conversation.getStatus());
        response.put("createdAt", conversation.getCreatedAt());
        response.put("context", context);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{conversationId}")
    public ResponseEntity<ConversationResponseDTO> getConversation(
            @PathVariable String conversationId) {
        ConversationResponseDTO conversation = conversationService.getConversation(conversationId);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/{conversationId}/messages")
    public ResponseEntity<Map<String, Object>> addMessage(
            @PathVariable String conversationId,
            @Valid @RequestBody MessageRequestDTO request) {

        String response = geminiService.askQuestion(request.getMessage(), conversationId);

        List<Message> messages = conversationService.getConversationHistory(conversationId);
        Message lastMessage = messages.get(messages.size() - 1);

        Map<String, Object> result = new HashMap<>();
        result.put("messageId", lastMessage.getId());
        result.put("userMessage", request.getMessage());
        result.put("aiResponse", response);
        result.put("timestamp", lastMessage.getCreatedAt());

        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String conversationId) {
        conversationService.deleteConversation(conversationId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<List<ConversationResponseDTO>> getUserConversations(
            @PathVariable String userId) {
        List<ConversationResponseDTO> conversations = conversationService.getConversationsByUserAsDTO(userId);
        return ResponseEntity.ok(conversations);
    }
}
