package com.ck.aiService.repository;

import com.ck.aiService.model.FileSummary;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileSummaryRepository extends JpaRepository<FileSummary, UUID> {

    Optional<FileSummary> findByFileId(Long fileId);

    List<FileSummary> findByFileIdIn(List<Long> fileIds);

    void deleteByFileId(Long fileId);

    boolean existsByFileId(Long fileId);
}
