package com.ck.aiService.dto;

import java.util.ArrayList;
import java.util.List;

public class FolderNodeDTO {

    private Long id;
    private String name;
    private Long parentId;
    private List<FolderFileDTO> files = new ArrayList<>();
    private List<FolderNodeDTO> children = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getParentId() {
        return parentId;
    }

    public void setParentId(Long parentId) {
        this.parentId = parentId;
    }

    public List<FolderFileDTO> getFiles() {
        return files;
    }

    public void setFiles(List<FolderFileDTO> files) {
        this.files = files;
    }

    public List<FolderNodeDTO> getChildren() {
        return children;
    }

    public void setChildren(List<FolderNodeDTO> children) {
        this.children = children;
    }
}
