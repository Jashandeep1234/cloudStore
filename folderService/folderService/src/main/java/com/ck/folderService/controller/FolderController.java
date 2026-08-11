package com.ck.folderService.controller;

import com.ck.folderService.models.FolderEntity;
import com.ck.folderService.repository.FolderRepository;
import com.ck.folderService.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/folder")
public class FolderController {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public List<FolderEntity> getAllFolders(HttpServletRequest request) {
        return folderRepository.findByUserId(requireUserId(request));
    }

    @GetMapping("/{id}")
    public FolderEntity getFolderById(@PathVariable Long id, HttpServletRequest request) {
        return folderRepository.findByIdAndUserId(id, requireUserId(request))
                .orElseThrow(() -> new RuntimeException("Folder not found"));
    }

    @PostMapping
    public Map<String, Object> createFolder(@RequestBody FolderEntity folder, HttpServletRequest request) {

        try {
            Long userId = requireUserId(request);

            if (folder.getName() == null || folder.getName().trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "Folder name cannot be empty"
                );
            }

            folder.setName(folder.getName().trim());
            folder.setUserId(userId);

            // Parent folder validation (must exist AND belong to this user)
            if (folder.getParentId() != null &&
                    folderRepository.findByIdAndUserId(folder.getParentId(), userId).isEmpty()) {

                return Map.of("success", false, "error", "Parent folder does not exist"
                );
            }

            // Duplicate check
            Optional<FolderEntity> duplicate;

            if (folder.getParentId() == null) {
                duplicate = folderRepository.findByUserIdAndNameAndParentIdIsNull(userId, folder.getName());
            } else {
                duplicate = folderRepository.findByUserIdAndNameAndParentId(userId,
                        folder.getName(), folder.getParentId());
            }
            if (duplicate.isPresent()) {
                return Map.of("success", false, "error", "Folder already exists"
                );
            }

            FolderEntity saved = folderRepository.save(folder);

            return Map.of("success", true, "folder", saved);
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }

    }

    @PutMapping("/{id}/rename")
    public Map<String, Object> renameFolder(@PathVariable Long id, @RequestBody Map<String, String> request, HttpServletRequest servletRequest) {

        try {
            Long userId = requireUserId(servletRequest);
            FolderEntity folder = folderRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() ->
                            new RuntimeException("Folder not found"));
            String newName = request.get("name");
            if (newName == null || newName.trim().isEmpty()) {
                return Map.of(
                        "success", false,
                        "error", "Folder name cannot be empty");
            }

            newName = newName.trim();

            Optional<FolderEntity> duplicate;

            if (folder.getParentId() == null) {
                duplicate = folderRepository.findByUserIdAndNameAndParentIdIsNull(userId, newName);
            } else {
                duplicate = folderRepository.findByUserIdAndNameAndParentId(userId, newName, folder.getParentId());
            }

            if (duplicate.isPresent()
                    && !duplicate.get().getId().equals(id)) {

                return Map.of(
                        "success", false,
                        "error", "Folder with same name already exists"
                );

            }

            folder.setName(newName);

            FolderEntity saved = folderRepository.save(folder);

            return Map.of("success", true, "folder", saved
            );
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> deleteFolder(@PathVariable Long id, HttpServletRequest request) {

        try {
            Long userId = requireUserId(request);
            FolderEntity folder = folderRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() ->
                            new RuntimeException("Folder not found"));
            // Check child folders
            if (folderRepository.existsByUserIdAndParentId(userId, id)) {
                return Map.of("success", false, "error", "Folder contains subfolders");
            }

            folderRepository.delete(folder);

            return Map.of("success", true, "message", "Folder deleted successfully");
        } catch (Exception e) {
            return Map.of("success", false, "error", e.getMessage());
        }
    }

    @PostMapping("/{id}/move-to-ai")
    public Map<String, Object> moveFolderToAI(@PathVariable Long id, HttpServletRequest request) {
        Long userId = requireUserId(request);
        if (!folderRepository.existsById(id)) {
            return Map.of("success", false, "error", "Folder not found");
        }
        if (folderRepository.findByIdAndUserId(id, userId).isEmpty()) {
            return Map.of("success", false, "error", "Folder not found");
        }
        return Map.of("success", true, "folderId", id);
    }

    @GetMapping("/root")
    public List<FolderEntity> getRootFolders(HttpServletRequest request) {
        return folderRepository.findByUserIdAndParentIdIsNull(requireUserId(request));
    }

    @GetMapping("/parent/{parentId}")
    public List<FolderEntity> getChildFolders(
            @PathVariable Long parentId, HttpServletRequest request) {

        return folderRepository.findByUserIdAndParentId(requireUserId(request), parentId);
    }

    /**
     * Resolves the authenticated user's id or throws 401 when missing.
     */
    private Long requireUserId(HttpServletRequest request) {
        Long userId = jwtUtil.getUserId(request);
        if (userId == null) {
            throw new UnauthorizedException("Missing or invalid access token");
        }
        return userId;
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    static class UnauthorizedException extends RuntimeException {
        UnauthorizedException(String message) {
            super(message);
        }
    }
}
