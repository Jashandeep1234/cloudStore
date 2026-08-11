package com.ck.aiService.service;

import com.ck.aiService.dto.FolderFileDTO;
import com.ck.aiService.dto.FolderNodeDTO;
import com.ck.aiService.exception.ServiceCommunicationException;
import com.ck.aiService.util.FileTypeValidator;
import java.io.File;
import java.nio.file.Files;
import java.util.ArrayList;
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

/**
 * Builds the complete architecture (nested folders + files) of a folder by
 * querying the external folder-service and file-service, and extracts file
 * contents so the AI can reason about what is inside the folder.
 */
@Service
public class FolderArchitectureService {

    private static final Logger log = LoggerFactory.getLogger(FolderArchitectureService.class);

    private final RestTemplate restTemplate;
    private final FileProcessingService fileProcessingService;
    private final FileTypeValidator fileTypeValidator;
    private final String fileServiceUrl;
    private final String folderServiceUrl;

    public FolderArchitectureService(RestTemplate restTemplate,
                                     FileProcessingService fileProcessingService,
                                     FileTypeValidator fileTypeValidator,
                                     @Value("${file-service.url}") String fileServiceUrl,
                                     @Value("${folder-service.url}") String folderServiceUrl) {
        this.restTemplate = restTemplate;
        this.fileProcessingService = fileProcessingService;
        this.fileTypeValidator = fileTypeValidator;
        this.fileServiceUrl = fileServiceUrl;
        this.folderServiceUrl = folderServiceUrl;
    }

    public FolderNodeDTO getFolderTree(Long folderId) {
        Map<String, Object> folder = getFolder(folderId);
        if (folder == null || folder.isEmpty()) {
            throw new ServiceCommunicationException("Folder not found: " + folderId, "folder-service");
        }

        FolderNodeDTO node = new FolderNodeDTO();
        node.setId(folderId);
        node.setName(String.valueOf(folder.getOrDefault("name", "Folder " + folderId)));
        Object parentRaw = folder.getOrDefault("parentId", folder.get("parent_folder_id"));
        node.setParentId(parentRaw instanceof Number n ? n.longValue() : null);
        node.setFiles(getFiles(folderId));
        node.setChildren(getChildren(folderId));
        return node;
    }

    public byte[] downloadFile(Long fileId) {
        try {
            ResponseEntity<byte[]> response = restTemplate.exchange(
                fileServiceUrl + "/files/download/" + fileId,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                byte[].class
            );
            return response.getBody();
        } catch (Exception e) {
            log.warn("Failed to download file {}: {}", fileId, e.getMessage());
            throw new ServiceCommunicationException(
                "Failed to download file " + fileId + ": " + e.getMessage(),
                "file-service",
                e
            );
        }
    }

    /**
     * Extracts readable text from raw file bytes based on the file extension.
     * Returns null for images and unsupported types.
     */
    public String extractText(byte[] content, String filename) {
        if (content == null || content.length == 0 || filename == null) {
            return null;
        }
        if (fileTypeValidator.isImage(filename)) {
            return null;
        }

        String ext = fileTypeValidator.getExtension(filename).toLowerCase();
        File temp = null;
        try {
            temp = File.createTempFile("folder_", "_" + filename);
            Files.write(temp.toPath(), content);

            if ("pdf".equals(ext)) {
                return fileProcessingService.extractTextFromPDF(temp);
            }
            if ("docx".equals(ext) || "doc".equals(ext)) {
                return fileProcessingService.extractTextFromDOCX(temp);
            }
            if ("xlsx".equals(ext) || "xls".equals(ext)) {
                return fileProcessingService.extractTextFromExcel(temp);
            }
            if ("txt".equals(ext) || "csv".equals(ext) || "md".equals(ext)
                    || "json".equals(ext) || "xml".equals(ext) || "log".equals(ext)) {
                return fileProcessingService.extractTextFromTxt(temp);
            }
            return null;
        } catch (Exception e) {
            log.warn("Failed to extract text from {}: {}", filename, e.getMessage());
            return null;
        } finally {
            if (temp != null && temp.exists()) {
                temp.delete();
            }
        }
    }

    private Map<String, Object> getFolder(Long folderId) {
        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                folderServiceUrl + "/folder/" + folderId,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            return response.getBody();
        } catch (Exception e) {
            log.warn("Failed to fetch folder {}: {}", folderId, e.getMessage());
            return Map.of();
        }
    }

    private List<FolderFileDTO> getFiles(Long folderId) {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                fileServiceUrl + "/files/folder/" + folderId,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<FolderFileDTO> files = new ArrayList<>();
            List<Map<String, Object>> body = response.getBody();
            if (body == null) {
                return files;
            }
            for (Map<String, Object> row : body) {
                FolderFileDTO dto = new FolderFileDTO();
                Object idRaw = row.get("id");
                if (!(idRaw instanceof Number)) {
                    continue;
                }
                dto.setId(((Number) idRaw).longValue());
                dto.setName(String.valueOf(row.getOrDefault("name", "file")));
                dto.setFolderId(folderId);
                Object sizeRaw = row.get("size");
                dto.setSize(sizeRaw instanceof Number n ? n.longValue() : null);
                dto.setType(fileTypeValidator.getExtension(dto.getName()).toLowerCase());
                files.add(dto);
            }
            return files;
        } catch (Exception e) {
            log.warn("Failed to fetch files for folder {}: {}", folderId, e.getMessage());
            return List.of();
        }
    }

    private List<FolderNodeDTO> getChildren(Long parentId) {
        try {
            ResponseEntity<List<Map<String, Object>>> response = restTemplate.exchange(
                folderServiceUrl + "/folder/parent/" + parentId,
                HttpMethod.GET,
                HttpEntity.EMPTY,
                new ParameterizedTypeReference<List<Map<String, Object>>>() {}
            );

            List<FolderNodeDTO> children = new ArrayList<>();
            List<Map<String, Object>> body = response.getBody();
            if (body == null) {
                return children;
            }
            for (Map<String, Object> row : body) {
                Object idRaw = row.get("id");
                if (idRaw instanceof Number) {
                    children.add(getFolderTree(((Number) idRaw).longValue()));
                }
            }
            return children;
        } catch (Exception e) {
            log.warn("Failed to fetch children for folder {}: {}", parentId, e.getMessage());
            return List.of();
        }
    }
}
