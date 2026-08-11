package com.ck.aiService.util;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class FileTypeValidator {

    private final Set<String> allowedExtensions;
    private final long maxFileSize;

    private static final Set<String> IMAGE_EXTENSIONS = new HashSet<>(Arrays.asList(
        "png", "jpg", "jpeg", "gif", "bmp", "webp"
    ));

    private static final Set<String> DOCUMENT_EXTENSIONS = new HashSet<>(Arrays.asList(
        "pdf", "txt", "docx", "doc", "csv"
    ));

    private static final Set<String> SPREADSHEET_EXTENSIONS = new HashSet<>(Arrays.asList(
        "xlsx", "xls", "csv"
    ));

    public FileTypeValidator(
            @Value("${file.upload.allowed-types}") String allowedTypes,
            @Value("${file.upload.max-size}") long maxFileSize) {
        this.allowedExtensions = new HashSet<>(Arrays.asList(allowedTypes.split(",")));
        this.maxFileSize = maxFileSize;
    }

    public boolean validateFileType(String filename) {
        if (filename == null || filename.isEmpty()) {
            return false;
        }
        String extension = getExtension(filename).toLowerCase();
        return allowedExtensions.contains(extension);
    }

    public boolean validateFileSize(long fileSize) {
        return fileSize <= maxFileSize;
    }

    public boolean isImage(String filename) {
        return IMAGE_EXTENSIONS.contains(getExtension(filename).toLowerCase());
    }

    public boolean isDocument(String filename) {
        return DOCUMENT_EXTENSIONS.contains(getExtension(filename).toLowerCase());
    }

    public boolean isSpreadsheet(String filename) {
        return SPREADSHEET_EXTENSIONS.contains(getExtension(filename).toLowerCase());
    }

    public boolean isPDF(String filename) {
        return "pdf".equals(getExtension(filename).toLowerCase());
    }

    public boolean isWordDocument(String filename) {
        String ext = getExtension(filename).toLowerCase();
        return "docx".equals(ext) || "doc".equals(ext);
    }

    public String getExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return "";
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return "";
        }
        return filename.substring(lastDotIndex + 1);
    }

    public Set<String> getAllowedExtensions() {
        return allowedExtensions;
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }
}
