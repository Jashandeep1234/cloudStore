package com.ck.aiService.repository;

import com.ck.aiService.model.Conversation;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    List<Conversation> findByUserIdOrderByUpdatedAtDesc(String userId);

    List<Conversation> findByUserIdAndStatusOrderByUpdatedAtDesc(String userId, String status);

    List<Conversation> findByFolderId(Long folderId);

    @Query("SELECT c FROM Conversation c WHERE c.userId = :userId AND " +
           "(LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "EXISTS (SELECT m FROM Message m WHERE m.conversation = c AND " +
           "LOWER(m.userMessage) LIKE LOWER(CONCAT('%', :query, '%')))) " +
           "ORDER BY c.updatedAt DESC")
    List<Conversation> searchByUserAndQuery(@Param("userId") String userId, @Param("query") String query);

    long countByUserId(String userId);
}
