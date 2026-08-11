package com.ck.aiService.repository;

import com.ck.aiService.model.Message;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    void deleteByConversationId(UUID conversationId);

    long countByConversationId(UUID conversationId);
}
