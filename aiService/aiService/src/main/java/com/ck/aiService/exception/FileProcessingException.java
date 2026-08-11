package com.ck.aiService.exception;

public class FileProcessingException extends RuntimeException {

    private final String fileName;

    public FileProcessingException(String message) {
        super(message);
        this.fileName = null;
    }

    public FileProcessingException(String message, String fileName) {
        super(message);
        this.fileName = fileName;
    }

    public FileProcessingException(String message, String fileName, Throwable cause) {
        super(message, cause);
        this.fileName = fileName;
    }

    public String getFileName() {
        return fileName;
    }
}
