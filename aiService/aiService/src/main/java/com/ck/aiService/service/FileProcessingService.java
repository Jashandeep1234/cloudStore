package com.ck.aiService.service;

import com.ck.aiService.dto.FileMetadataDTO;
import com.ck.aiService.exception.FileProcessingException;
import com.ck.aiService.util.FileTypeValidator;
import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;
import java.util.UUID;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileProcessingService {

    private static final Logger log = LoggerFactory.getLogger(FileProcessingService.class);
    private static final int CHUNK_SIZE = 50000;

    private final FileTypeValidator fileTypeValidator;
    private final Path storagePath;
    private final Path tempPath;

    public FileProcessingService(
            FileTypeValidator fileTypeValidator,
            @Value("${file.storage.path}") String storagePath,
            @Value("${file.storage.temp-path}") String tempPath) {
        this.fileTypeValidator = fileTypeValidator;
        this.storagePath = Path.of(storagePath);
        this.tempPath = Path.of(tempPath);
        createDirectories();
    }

    private void createDirectories() {
        try {
            Files.createDirectories(storagePath);
            Files.createDirectories(tempPath);
        } catch (IOException e) {
            throw new FileProcessingException("Failed to create storage directories", e.getMessage());
        }
    }

    public FileMetadataDTO processFile(MultipartFile multipartFile) {
        validateFile(multipartFile);

        FileMetadataDTO metadata = getFileMetadata(multipartFile);

        File tempFile = saveToTemp(multipartFile);
        try {
            String extension = fileTypeValidator.getExtension(multipartFile.getOriginalFilename());
            String extractedContent;

            if (fileTypeValidator.isImage(multipartFile.getOriginalFilename())) {
                extractedContent = "[Image file: " + multipartFile.getOriginalFilename() + "]";
            } else if (fileTypeValidator.isPDF(multipartFile.getOriginalFilename())) {
                extractedContent = extractTextFromPDF(tempFile);
            } else if (fileTypeValidator.isWordDocument(multipartFile.getOriginalFilename())) {
                extractedContent = extractTextFromDOCX(tempFile);
            } else if (fileTypeValidator.isSpreadsheet(multipartFile.getOriginalFilename())) {
                extractedContent = extractTextFromExcel(tempFile);
            } else {
                extractedContent = extractTextFromTxt(tempFile);
            }

            metadata.setFileType(extension);

            return metadata;
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    public String extractContent(MultipartFile multipartFile) {
        validateFile(multipartFile);

        File tempFile = saveToTemp(multipartFile);
        try {
            if (fileTypeValidator.isImage(multipartFile.getOriginalFilename())) {
                return convertImageToBase64(tempFile);
            } else if (fileTypeValidator.isPDF(multipartFile.getOriginalFilename())) {
                return extractTextFromPDF(tempFile);
            } else if (fileTypeValidator.isWordDocument(multipartFile.getOriginalFilename())) {
                return extractTextFromDOCX(tempFile);
            } else if (fileTypeValidator.isSpreadsheet(multipartFile.getOriginalFilename())) {
                return extractTextFromExcel(tempFile);
            } else {
                return extractTextFromTxt(tempFile);
            }
        } finally {
            cleanupTempFile(tempFile);
        }
    }

    public String extractTextFromPDF(File file) {
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return text.trim();
        } catch (IOException e) {
            log.error("Failed to extract text from PDF: {}", file.getName(), e);
            throw new FileProcessingException("Failed to extract text from PDF", file.getName(), e);
        }
    }

    public String extractTextFromDOCX(File file) {
        try (FileInputStream fis = new FileInputStream(file);
             XWPFDocument document = new XWPFDocument(fis);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText().trim();
        } catch (IOException e) {
            log.error("Failed to extract text from DOCX: {}", file.getName(), e);
            throw new FileProcessingException("Failed to extract text from document", file.getName(), e);
        }
    }

    public String extractTextFromExcel(File file) {
        StringBuilder text = new StringBuilder();
        String fileName = file.getName().toLowerCase();

        try (InputStream is = new BufferedInputStream(new FileInputStream(file))) {
            Workbook workbook;
            if (fileName.endsWith(".xlsx")) {
                workbook = new XSSFWorkbook(is);
            } else if (fileName.endsWith(".xls")) {
                workbook = new HSSFWorkbook(is);
            } else {
                return extractTextFromTxt(file);
            }

            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                text.append("Sheet: ").append(sheet.getSheetName()).append("\n");

                for (Row row : sheet) {
                    for (Cell cell : row) {
                        switch (cell.getCellType()) {
                            case STRING -> text.append(cell.getStringCellValue()).append("\t");
                            case NUMERIC -> text.append(cell.getNumericCellValue()).append("\t");
                            case BOOLEAN -> text.append(cell.getBooleanCellValue()).append("\t");
                            case FORMULA -> {
                                try {
                                    text.append(cell.getNumericCellValue()).append("\t");
                                } catch (Exception e) {
                                    text.append(cell.getStringCellValue()).append("\t");
                                }
                            }
                            default -> text.append("\t");
                        }
                    }
                    text.append("\n");
                }
                text.append("\n");
            }

            workbook.close();
            return text.toString().trim();
        } catch (IOException e) {
            log.error("Failed to extract text from spreadsheet: {}", file.getName(), e);
            throw new FileProcessingException("Failed to extract text from spreadsheet", file.getName(), e);
        }
    }

    public String extractTextFromTxt(File file) {
        try {
            return Files.readString(file.toPath(), StandardCharsets.UTF_8).trim();
        } catch (IOException e) {
            log.error("Failed to read text file: {}", file.getName(), e);
            throw new FileProcessingException("Failed to read text file", file.getName(), e);
        }
    }

    public String convertImageToBase64(File imageFile) {
        try {
            byte[] imageBytes = Files.readAllBytes(imageFile.toPath());
            return Base64.getEncoder().encodeToString(imageBytes);
        } catch (IOException e) {
            log.error("Failed to convert image to base64: {}", imageFile.getName(), e);
            throw new FileProcessingException("Failed to convert image to base64", imageFile.getName(), e);
        }
    }

    public String getImageMimeType(String filename) {
        String ext = fileTypeValidator.getExtension(filename).toLowerCase();
        return switch (ext) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "gif" -> "image/gif";
            case "bmp" -> "image/bmp";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    public boolean validateFileType(String filename) {
        return fileTypeValidator.validateFileType(filename);
    }

    public FileMetadataDTO getFileMetadata(MultipartFile file) {
        FileMetadataDTO metadata = new FileMetadataDTO();
        metadata.setFileName(file.getOriginalFilename());
        metadata.setFileSize(file.getSize());
        metadata.setContentType(file.getContentType());
        metadata.setExtension(fileTypeValidator.getExtension(file.getOriginalFilename()));
        metadata.setFileType(fileTypeValidator.getExtension(file.getOriginalFilename()));
        return metadata;
    }

    public void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileProcessingException("File is empty or null", file != null ? file.getOriginalFilename() : "unknown");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            throw new FileProcessingException("File has no name");
        }

        if (!fileTypeValidator.validateFileType(filename)) {
            throw new FileProcessingException(
                "Invalid file type: " + fileTypeValidator.getExtension(filename)
                + ". Allowed types: " + String.join(", ", fileTypeValidator.getAllowedExtensions()),
                filename
            );
        }

        if (!fileTypeValidator.validateFileSize(file.getSize())) {
            throw new FileProcessingException(
                "File size " + file.getSize() + " exceeds maximum allowed size of "
                + fileTypeValidator.getMaxFileSize() + " bytes",
                filename
            );
        }
    }

    public String[] chunkContent(String content) {
        if (content == null || content.length() <= CHUNK_SIZE) {
            return new String[]{content};
        }

        int chunks = (int) Math.ceil((double) content.length() / CHUNK_SIZE);
        String[] result = new String[chunks];
        for (int i = 0; i < chunks; i++) {
            int start = i * CHUNK_SIZE;
            int end = Math.min(start + CHUNK_SIZE, content.length());
            result[i] = content.substring(start, end);
        }
        return result;
    }

    private File saveToTemp(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String tempFilename = UUID.randomUUID() + "_" + (originalFilename != null ? originalFilename : "temp");
        Path tempFilePath = tempPath.resolve(tempFilename);

        try (OutputStream os = new FileOutputStream(tempFilePath.toFile())) {
            os.write(file.getBytes());
            return tempFilePath.toFile();
        } catch (IOException e) {
            throw new FileProcessingException("Failed to save file to temporary storage", originalFilename, e);
        }
    }

    private void cleanupTempFile(File tempFile) {
        if (tempFile != null && tempFile.exists()) {
            try {
                Files.deleteIfExists(tempFile.toPath());
            } catch (IOException e) {
                log.warn("Failed to delete temp file: {}", tempFile.getAbsolutePath());
            }
        }
    }
}
