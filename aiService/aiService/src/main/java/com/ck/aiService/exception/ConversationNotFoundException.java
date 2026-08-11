package com.ck.aiService.exception;

import java.util.UUID;

public class ConversationNotFoundException extends RuntimeException {

    private final UUID conversationId;

    public ConversationNotFoundException(UUID conversationId) {
        super("Conversation not found with id: " + conversationId);
        this.conversationId = conversationId;
    }

    public UUID getConversationId() {
        return conversationId;
    }
}
