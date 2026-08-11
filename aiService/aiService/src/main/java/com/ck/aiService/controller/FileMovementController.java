package com.ck.aiService.controller;

import com.ck.aiService.dto.FileDTO;
import com.ck.aiService.dto.FolderDTO;
import com.ck.aiService.dto.FolderNodeDTO;
import com.ck.aiService.dto.MoveFilesRequestDTO;
import com.ck.aiService.service.FileMovementService;
import com.ck.aiService.service.FolderArchitectureService;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/files")
public class FileMovementController {

    private static final Logger log = LoggerFactory.getLogger(FileMovementController.class);

    private final FileMovementService fileMovementService;
    private final FolderArchitectureService folderArchitectureService;

    public FileMovementController(FileMovementService fileMovementService,
                                  FolderArchitectureService folderArchitectureService) {
        this.fileMovementService = fileMovementService;
        this.folderArchitectureService = folderArchitectureService;
    }

    @PostMapping("/move")
    public ResponseEntity<Map<String, Object>> moveFilesToFolder(
            @Valid @RequestBody MoveFilesRequestDTO request) {

        ResponseEntity<Map<String, Object>> serviceResponse = fileMovementService.moveFilesToFolder(
            request.getFileIds(),
            request.getTargetFolderId()
        );

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("movedCount", request.getFileIds().size());
        response.put("errors", 0);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/available-folders")
    public ResponseEntity<List<FolderDTO>> getAvailableFolders() {
        List<FolderDTO> folders = fileMovementService.getAvailableFolders();
        return ResponseEntity.ok(folders);
    }

    @PostMapping("/folders/to-ai")
    public ResponseEntity<Map<String, Object>> moveFolderToAIService(
            @RequestBody Map<String, Long> request) {
        Long folderId = request.get("folderId");
        if (folderId == null) {
            return ResponseEntity.badRequest().build();
        }

        fileMovementService.moveFolderToAIService(folderId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("folderId", folderId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/folders/{folderId}/files")
    public ResponseEntity<List<FileDTO>> getFilesInFolder(@PathVariable Long folderId) {
        List<FileDTO> files = fileMovementService.getFilesInFolder(folderId);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/folders/{folderId}/architecture")
    public ResponseEntity<FolderNodeDTO> getFolderArchitecture(@PathVariable Long folderId) {
        FolderNodeDTO tree = folderArchitectureService.getFolderTree(folderId);
        return ResponseEntity.ok(tree);
    }
}
