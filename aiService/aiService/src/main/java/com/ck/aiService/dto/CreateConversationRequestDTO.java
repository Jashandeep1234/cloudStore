package com.ck.aiService.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class CreateConversationRequestDTO {

    @NotBlank(message = "UserId is required")
    private String userId;

    private List<Long> fileIds;

    private Long folderId;

    private String title;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
