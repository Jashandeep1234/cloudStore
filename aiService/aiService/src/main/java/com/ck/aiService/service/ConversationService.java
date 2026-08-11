package com.ck.aiService.service;

import com.ck.aiService.dto.ConversationResponseDTO;
import com.ck.aiService.dto.ConversationResponseDTO.MessageDTO;
import com.ck.aiService.exception.ConversationNotFoundException;
import com.ck.aiService.model.Conversation;
import com.ck.aiService.model.Message;
import com.ck.aiService.repository.ConversationRepository;
import com.ck.aiService.repository.MessageRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ConversationService {

    private static final Logger log = LoggerFactory.getLogger(ConversationService.class);

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;

    public ConversationService(ConversationRepository conversationRepository,
                               MessageRepository messageRepository) {
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
    }

    public Conversation createConversation(String userId, List<Long> fileIds, Long folderId) {
        return createConversation(userId, fileIds, folderId, null);
    }

    public Conversation createConversation(String userId, List<Long> fileIds, Long folderId, String title) {
        Conversation conversation = new Conversation();
        conversation.setUserId(userId);
        conversation.setFolderId(folderId);
        conversation.setTitle(title != null ? title : "Conversation - " + java.time.LocalDateTime.now().toString());
        conversation.setStatus("ACTIVE");

        Conversation saved = conversationRepository.save(conversation);
        log.info("Created conversation: {} for user: {}", saved.getId(), userId);
        return saved;
    }

    public Message addMessageToConversation(String conversationId, String userMessage, String aiResponse) {
        UUID uuid = parseConversationId(conversationId);
        Conversation conversation = conversationRepository.findById(uuid)
            .orElseThrow(() -> new ConversationNotFoundException(uuid));

        Message message = new Message();
        message.setConversation(conversation);
        message.setUserMessage(userMessage);
        message.setAiResponse(aiResponse);

        Message saved = messageRepository.save(message);
        log.debug("Added message to conversation: {}", conversationId);
        return saved;
    }

    public List<Message> getConversationHistory(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        if (!conversationRepository.existsById(uuid)) {
            throw new ConversationNotFoundException(uuid);
        }
        return messageRepository.findByConversationIdOrderByCreatedAtAsc(uuid);
    }

    public ConversationResponseDTO getConversation(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        Conversation conversation = conversationRepository.findById(uuid)
            .orElseThrow(() -> new ConversationNotFoundException(uuid));

        return toResponseDTO(conversation);
    }

    public List<Conversation> getConversationsByUser(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
    }

    public List<ConversationResponseDTO> getConversationsByUserAsDTO(String userId) {
        return conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    public List<Conversation> searchConversations(String query, String userId) {
        if (query == null || query.trim().isEmpty()) {
            return getConversationsByUser(userId);
        }
        return conversationRepository.searchByUserAndQuery(userId, query.trim());
    }

    @Transactional
    public void deleteConversation(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        if (!conversationRepository.existsById(uuid)) {
            throw new ConversationNotFoundException(uuid);
        }
        messageRepository.deleteByConversationId(uuid);
        conversationRepository.deleteById(uuid);
        log.info("Deleted conversation: {}", conversationId);
    }

    public Conversation archiveConversation(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        Conversation conversation = conversationRepository.findById(uuid)
            .orElseThrow(() -> new ConversationNotFoundException(uuid));
        conversation.setStatus("ARCHIVED");
        Conversation saved = conversationRepository.save(conversation);
        log.info("Archived conversation: {}", conversationId);
        return saved;
    }

    public String getFormattedHistory(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        if (!conversationRepository.existsById(uuid)) {
            return "";
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(uuid);
        if (messages.isEmpty()) {
            return "";
        }

        StringBuilder history = new StringBuilder();
        for (Message msg : messages) {
            history.append("User: ").append(msg.getUserMessage()).append("\n");
            history.append("AI: ").append(msg.getAiResponse()).append("\n\n");
        }
        return history.toString().trim();
    }

    @Transactional
    public void updateContext(String conversationId, String context) {
        UUID uuid = parseConversationId(conversationId);
        Conversation conversation = conversationRepository.findById(uuid)
            .orElseThrow(() -> new ConversationNotFoundException(uuid));
        conversation.setContext(context);
        conversationRepository.save(conversation);
        log.info("Updated context for conversation: {}", conversationId);
    }

    public String getContext(String conversationId) {
        UUID uuid = parseConversationId(conversationId);
        return conversationRepository.findById(uuid)
            .map(Conversation::getContext)
            .orElse(null);
    }

    public ConversationResponseDTO toResponseDTO(Conversation conversation) {
        ConversationResponseDTO dto = new ConversationResponseDTO();
        dto.setId(conversation.getId());
        dto.setUserId(conversation.getUserId());
        dto.setFolderId(conversation.getFolderId());
        dto.setTitle(conversation.getTitle());
        dto.setStatus(conversation.getStatus());
        dto.setContext(conversation.getContext());
        dto.setCreatedAt(conversation.getCreatedAt());
        dto.setUpdatedAt(conversation.getUpdatedAt());

        List<MessageDTO> messageDTOs = conversation.getMessages().stream()
            .map(this::toMessageDTO)
            .collect(Collectors.toList());
        dto.setMessages(messageDTOs);

        return dto;
    }

    private MessageDTO toMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setUserMessage(message.getUserMessage());
        dto.setAiResponse(message.getAiResponse());
        dto.setTokensUsed(message.getTokensUsed());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }

    private UUID parseConversationId(String conversationId) {
        try {
            return UUID.fromString(conversationId);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid conversation ID format: " + conversationId);
        }
    }
}
