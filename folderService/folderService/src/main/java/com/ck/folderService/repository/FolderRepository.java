package com.ck.folderService.repository;

import com.ck.folderService.models.FolderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FolderRepository extends JpaRepository<FolderEntity, Long> {

    List<FolderEntity> findByUserId(Long userId);

    List<FolderEntity> findByParentId(Long parentId);

    List<FolderEntity> findByUserIdAndParentId(Long userId, Long parentId);

    List<FolderEntity> findByParentIdIsNull();

    List<FolderEntity> findByUserIdAndParentIdIsNull(Long userId);

    Optional<FolderEntity> findByIdAndUserId(Long id, Long userId);

    Optional<FolderEntity> findByNameAndParentId(String name, Long parentId);

    Optional<FolderEntity> findByNameAndParentIdIsNull(String name);

    Optional<FolderEntity> findByUserIdAndNameAndParentId(Long userId, String name, Long parentId);

    Optional<FolderEntity> findByUserIdAndNameAndParentIdIsNull(Long userId, String name);

    boolean existsByParentId(Long parentId);

    boolean existsByUserIdAndParentId(Long userId, Long parentId);
}
