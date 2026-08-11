package com.ck.aiService.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class MoveFilesRequestDTO {

    @NotEmpty(message = "File IDs list is required")
    private List<Long> fileIds;

    @NotNull(message = "Target folder ID is required")
    private Long targetFolderId;

    public List<Long> getFileIds() {
        return fileIds;
    }

    public void setFileIds(List<Long> fileIds) {
        this.fileIds = fileIds;
    }

    public Long getTargetFolderId() {
        return targetFolderId;
    }

    public void setTargetFolderId(Long targetFolderId) {
        this.targetFolderId = targetFolderId;
    }
}
