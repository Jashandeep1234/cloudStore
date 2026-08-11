package com.ck.fileService.repository;

import com.ck.fileService.models.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FileRepository extends JpaRepository<FileEntity, Long> {
    List<FileEntity> findByUserId(Long userId);
    List<FileEntity> findByFolderId(Long folderId);
    List<FileEntity> findByUserIdAndFolderId(Long userId, Long folderId);
    Optional<FileEntity> findByIdAndUserId(Long id, Long userId);
    List<FileEntity> findByNameContainingIgnoreCase(String name);
    List<FileEntity> findByUserIdAndNameContainingIgnoreCase(Long userId, String name);
    boolean existsByNameAndFolderId(String name, Long folderId);
}
