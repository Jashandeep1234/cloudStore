package com.ck.searchService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "fileService", url = "http://localhost:8081")
public interface fileServiceClient {

    @GetMapping("/api/files")
    List<Map<String, Object>> getAllFiles();

    @GetMapping("/api/files/folder/{folderId}")
    List<Map<String, Object>> getAllfilesbyFolderId(
            @PathVariable("folderId") Long folderId);

}
