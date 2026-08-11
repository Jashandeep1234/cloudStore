package com.ck.aiService.service;

import com.ck.aiService.dto.FolderFileDTO;
import com.ck.aiService.dto.FolderNodeDTO;
import com.ck.aiService.model.FileSummary;
import com.ck.aiService.repository.FileSummaryRepository;
import com.ck.aiService.util.FileTypeValidator;
import java.util.Base64;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Analyzes a folder for use in conversations: builds the full folder
 * architecture, reads every file's content and produces an AI summary for each
 * one (cached in the database), then renders everything as a text block that
 * becomes the conversation context for Gemini.
 */
@Service
public class FolderAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(FolderAnalysisService.class);

    private final FolderArchitectureService folderArchitectureService;
    private final FileProcessingService fileProcessingService;
    private final GeminiService geminiService;
    private final FileSummaryRepository fileSummaryRepository;
    private final FileTypeValidator fileTypeValidator;

    public FolderAnalysisService(FolderArchitectureService folderArchitectureService,
                                 FileProcessingService fileProcessingService,
                                 GeminiService geminiService,
                                 FileSummaryRepository fileSummaryRepository,
                                 FileTypeValidator fileTypeValidator) {
        this.folderArchitectureService = folderArchitectureService;
        this.fileProcessingService = fileProcessingService;
        this.geminiService = geminiService;
        this.fileSummaryRepository = fileSummaryRepository;
        this.fileTypeValidator = fileTypeValidator;
    }

    public String buildFolderContext(Long folderId) {
        FolderNodeDTO tree = folderArchitectureService.getFolderTree(folderId);
        summarizeNode(tree);
        return renderNode(tree, 0);
    }

    private void summarizeNode(FolderNodeDTO node) {
        for (FolderFileDTO file : node.getFiles()) {
            file.setSummary(summarizeFile(file));
        }
        for (FolderNodeDTO child : node.getChildren()) {
            summarizeNode(child);
        }
    }

    private String summarizeFile(FolderFileDTO file) {
        if (file.getId() == null) {
            return "(unknown file)";
        }

        Optional<FileSummary> cached = fileSummaryRepository.findByFileId(file.getId());
        if (cached.isPresent()) {
            return cached.get().getSummary();
        }

        try {
            byte[] bytes = folderArchitectureService.downloadFile(file.getId());
            if (bytes == null || bytes.length == 0) {
                return "(empty file)";
            }

            String name = file.getName();
            String summary;
            if (fileTypeValidator.isImage(name)) {
                String base64 = Base64.getEncoder().encodeToString(bytes);
                String mimeType = fileProcessingService.getImageMimeType(name);
                summary = geminiService.analyzeImage(base64, mimeType);
            } else {
                String text = folderArchitectureService.extractText(bytes, name);
                if (text == null || text.isBlank()) {
                    return "(no extractable text)";
                }
                summary = geminiService.generateSummaryWithCaching(file.getId(), text, file.getType());
            }

            cacheSummary(file, summary);
            return summary;
        } catch (Exception e) {
            log.warn("Failed to summarize file {} ({}): {}", file.getId(), file.getName(), e.getMessage());
            return "(failed to read file)";
        }
    }

    private void cacheSummary(FolderFileDTO file, String summary) {
        FileSummary fileSummary = new FileSummary();
        fileSummary.setFileId(file.getId());
        fileSummary.setSummary(summary);
        fileSummary.setFileName(file.getName());
        fileSummary.setFileType(file.getType());
        fileSummaryRepository.save(fileSummary);
    }

    private String renderNode(FolderNodeDTO node, int depth) {
        StringBuilder sb = new StringBuilder();
        sb.append("  ".repeat(depth)).append(node.getName()).append("/").append("\n");

        for (FolderFileDTO file : node.getFiles()) {
            sb.append("  ".repeat(depth)).append("  - ").append(file.getName());
            if (file.getSummary() != null && !file.getSummary().isBlank()) {
                sb.append(" : ").append(file.getSummary().trim());
            }
            sb.append("\n");
        }

        for (FolderNodeDTO child : node.getChildren()) {
            sb.append(renderNode(child, depth + 1));
        }
        return sb.toString();
    }
}
