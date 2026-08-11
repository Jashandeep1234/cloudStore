package com.ck.aiService.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AnalysisRequestDTO {

    private List<Long> fileIds;

    private Long folderId;

    @NotBlank(message = "UserId is required")
    private String userId;

    public List<Long> getFileIds() {
        return fileIds;
    }

    public void setFileIds(List<Long> fileIds) {
        this.fileIds = fileIds;
    }

    public Long getFolderId() {
        return folderId;
    }

    public void setFolderId(Long folderId) {
        this.folderId = folderId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
