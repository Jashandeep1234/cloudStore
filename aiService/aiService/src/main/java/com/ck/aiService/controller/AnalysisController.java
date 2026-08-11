package com.ck.aiService.controller;

import com.ck.aiService.dto.FileAnalysisDTO;
import com.ck.aiService.dto.FileMetadataDTO;
import com.ck.aiService.exception.FileProcessingException;
import com.ck.aiService.model.FileSummary;
import com.ck.aiService.repository.FileSummaryRepository;
import com.ck.aiService.service.FileProcessingService;
import com.ck.aiService.service.GeminiService;
import com.ck.aiService.util.FileTypeValidator;
import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/analyze")
public class AnalysisController {

    private static final Logger log = LoggerFactory.getLogger(AnalysisController.class);

    private final GeminiService geminiService;
    private final FileProcessingService fileProcessingService;
    private final FileSummaryRepository fileSummaryRepository;
    private final FileTypeValidator fileTypeValidator;

    public AnalysisController(GeminiService geminiService,
                              FileProcessingService fileProcessingService,
                              FileSummaryRepository fileSummaryRepository,
                              FileTypeValidator fileTypeValidator) {
        this.geminiService = geminiService;
        this.fileProcessingService = fileProcessingService;
        this.fileSummaryRepository = fileSummaryRepository;
        this.fileTypeValidator = fileTypeValidator;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<FileAnalysisDTO> analyzeFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "folderId", required = false) Long folderId) {

        log.info("Received file analysis request: {}", file.getOriginalFilename());

        FileMetadataDTO metadata = fileProcessingService.processFile(file);
        String content = fileProcessingService.extractContent(file);

        String analysis;
        if (fileTypeValidator.isImage(file.getOriginalFilename())) {
            File tempFile = saveToTempAndGetFile(file);
            try {
                String base64Image = fileProcessingService.convertImageToBase64(tempFile);
                String mimeType = fileProcessingService.getImageMimeType(file.getOriginalFilename());
                analysis = geminiService.analyzeImage(base64Image, mimeType);
            } finally {
                if (tempFile.exists()) {
                    tempFile.delete();
                }
            }
        } else {
            analysis = geminiService.analyzeFile(content, file.getOriginalFilename(), metadata.getFileType());
        }

        FileAnalysisDTO result = buildAnalysisResult(file, metadata, analysis);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/summary")
    public ResponseEntity<FileAnalysisDTO> getQuickSummary(
            @RequestParam("file") MultipartFile file) {

        log.info("Received quick summary request: {}", file.getOriginalFilename());

        String content = fileProcessingService.extractContent(file);
        String summary = geminiService.generateSummary(content, file.getOriginalFilename());

        FileAnalysisDTO result = new FileAnalysisDTO();
        result.setId(UUID.randomUUID());
        result.setStatus("COMPLETED");
        result.setSummary(summary);
        result.setFileName(file.getOriginalFilename());
        result.setCreatedAt(LocalDateTime.now());

        return ResponseEntity.ok(result);
    }

    @PostMapping("/batch")
    public ResponseEntity<List<FileAnalysisDTO>> analyzeBatch(@RequestBody List<Long> fileIds) {
        log.info("Received batch analysis request for {} files", fileIds != null ? fileIds.size() : 0);

        if (fileIds == null || fileIds.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        List<FileAnalysisDTO> results = new ArrayList<>();
        for (Long fileId : fileIds) {
            Optional<FileSummary> cachedSummary = fileSummaryRepository.findByFileId(fileId);
            if (cachedSummary.isPresent()) {
                FileSummary fs = cachedSummary.get();
                FileAnalysisDTO dto = new FileAnalysisDTO();
                dto.setId(fs.getId());
                dto.setFileId(fileId);
                dto.setSummary(fs.getSummary());
                dto.setStatus("COMPLETED");
                dto.setModelUsed(fs.getModelUsed());
                dto.setCreatedAt(fs.getCreatedAt());
                results.add(dto);
            } else {
                FileAnalysisDTO dto = new FileAnalysisDTO();
                dto.setFileId(fileId);
                dto.setStatus("PENDING");
                dto.setCreatedAt(LocalDateTime.now());
                results.add(dto);
            }
        }

        return ResponseEntity.ok(results);
    }

    @GetMapping("/{fileId}")
    public ResponseEntity<FileAnalysisDTO> getCachedAnalysis(@PathVariable Long fileId) {
        Optional<FileSummary> cachedSummary = fileSummaryRepository.findByFileId(fileId);

        if (cachedSummary.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        FileSummary fs = cachedSummary.get();
        FileAnalysisDTO result = new FileAnalysisDTO();
        result.setId(fs.getId());
        result.setFileId(fileId);
        result.setSummary(fs.getSummary());
        result.setFileName(fs.getFileName());
        result.setFileType(fs.getFileType());
        result.setStatus("COMPLETED");
        result.setModelUsed(fs.getModelUsed());
        result.setTokensUsed(fs.getTokensUsed());
        result.setCreatedAt(fs.getCreatedAt());

        return ResponseEntity.ok(result);
    }

    private FileAnalysisDTO buildAnalysisResult(MultipartFile file, FileMetadataDTO metadata, String analysis) {
        FileAnalysisDTO result = new FileAnalysisDTO();
        result.setId(UUID.randomUUID());
        result.setStatus("COMPLETED");
        result.setSummary(analysis);
        result.setFileMetadata(metadata);
        result.setFileName(file.getOriginalFilename());
        result.setFileType(metadata.getFileType());
        result.setCreatedAt(LocalDateTime.now());
        return result;
    }

    private File saveToTempAndGetFile(MultipartFile file) {
        try {
            File tempFile = File.createTempFile("upload_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile);
            return tempFile;
        } catch (Exception e) {
            throw new FileProcessingException("Failed to save file temporarily", file.getOriginalFilename(), e);
        }
    }
}
