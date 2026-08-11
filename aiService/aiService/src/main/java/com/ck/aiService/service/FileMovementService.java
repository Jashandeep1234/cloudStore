package com.ck.aiService.service;

import com.ck.aiService.dto.FileDTO;
import com.ck.aiService.dto.FolderDTO;
import com.ck.aiService.dto.MoveFilesRequestDTO;
import com.ck.aiService.exception.ServiceCommunicationException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FileMovementService {

    private static final Logger log = LoggerFactory.getLogger(FileMovementService.class);

    private final RestTemplate restTemplate;
    private final String fileServiceUrl;
    private final String folderServiceUrl;

    public FileMovementService(RestTemplate restTemplate,
                               @Value("${file-service.url}") String fileServiceUrl,
                               @Value("${folder-service.url}") String folderServiceUrl) {
        this.restTemplate = restTemplate;
        this.fileServiceUrl = fileServiceUrl;
        this.folderServiceUrl = folderServiceUrl;
    }

    public ResponseEntity<Map<String, Object>> moveFilesToFolder(List<Long> fileIds, Long targetFolderId) {
        try {
            String url = fileServiceUrl + "/files/move";
            MoveFilesRequestDTO request = new MoveFilesRequestDTO();
            request.setFileIds(fileIds);
            request.setTargetFolderId(targetFolderId);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                new HttpEntity<>(request),
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            log.info("Moved {} files to folder: {}", fileIds.size(), targetFolderId);
            return response;
        } catch (Exception e) {
            log.error("Failed to move files to folder: {}", targetFolderId, e);
            throw new ServiceCommunicationException(
                "Failed to move files to folder: " + e.getMessage(),
                "file-service",
                e
            );
        }
    }

    public ResponseEntity<Map<String, Object>> moveFolderToAIService(Long folderId) {
        try {
            String url = folderServiceUrl + "/folder/" + folderId + "/move-to-ai";

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );

            log.info("Moved folder {} to AI service", folderId);
            return response;
        } catch (Exception e) {
            log.error("Failed to move folder to AI service: {}", folderId, e);
            throw new ServiceCommunicationException(
                "Failed to move folder to AI service: " + e.getMessage(),
                "folder-service",
                e
            );
        }
    }

    public List<FolderDTO> getAvailableFolders() {
        try {
            String url = folderServiceUrl + "/folder";

            ParameterizedTypeReference<List<FolderDTO>> typeRef = new ParameterizedTypeReference<List<FolderDTO>>() {};
            ResponseEntity<List<FolderDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                typeRef
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch available folders", e);
            throw new ServiceCommunicationException(
                "Failed to fetch available folders: " + e.getMessage(),
                "folder-service",
                e
            );
        }
    }

    public List<FileDTO> getFilesInFolder(Long folderId) {
        try {
            String url = fileServiceUrl + "/files/folder/" + folderId;

            ParameterizedTypeReference<List<FileDTO>> typeRef = new ParameterizedTypeReference<List<FileDTO>>() {};
            ResponseEntity<List<FileDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                typeRef
            );

            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to fetch files for folder: {}", folderId, e);
            throw new ServiceCommunicationException(
                "Failed to fetch files for folder: " + e.getMessage(),
                "file-service",
                e
            );
        }
    }

    public boolean validateMoveOperation(Long fileId, Long targetFolderId) {
        try {
            String url = fileServiceUrl + "/files/" + fileId + "/validate-move?targetFolderId=" + targetFolderId;

            ParameterizedTypeReference<Map<String, Object>> typeRef = new ParameterizedTypeReference<Map<String, Object>>() {};
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                typeRef
            );

            Map<String, Object> body = response.getBody();
            return body != null && Boolean.TRUE.equals(body.get("valid"));
        } catch (Exception e) {
            log.error("Failed to validate move operation for file: {} to folder: {}", fileId, targetFolderId, e);
            return false;
        }
    }
}
