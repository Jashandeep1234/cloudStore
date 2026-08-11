package com.ck.aiService.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class ConversationResponseDTO {

    private UUID id;
    private String userId;
    private Long folderId;
    private String title;
    private String status;
    private String context;
    private List<MessageDTO> messages;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static class MessageDTO {
        private UUID id;
        private String userMessage;
        private String aiResponse;
        private Integer tokensUsed;
        private LocalDateTime createdAt;

        public UUID getId() {
            return id;
        }

        public void setId(UUID id) {
            this.id = id;
        }

        public String getUserMessage() {
            return userMessage;
        }

        public void setUserMessage(String userMessage) {
            this.userMessage = userMessage;
        }

        public String getAiResponse() {
            return aiResponse;
        }

        public void setAiResponse(String aiResponse) {
            this.aiResponse = aiResponse;
        }

        public Integer getTokensUsed() {
            return tokensUsed;
        }

        public void setTokensUsed(Integer tokensUsed) {
            this.tokensUsed = tokensUsed;
        }

        public LocalDateTime getCreatedAt() {
            return createdAt;
        }

        public void setCreatedAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getContext() {
        return context;
    }

    public void setContext(String context) {
        this.context = context;
    }

    public List<MessageDTO> getMessages() {
        return messages;
    }

    public void setMessages(List<MessageDTO> messages) {
        this.messages = messages;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
