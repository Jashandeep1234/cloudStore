package com.ck.searchService.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;
import java.util.Map;

@FeignClient(name = "folderService", url = "http://localhost:8082")
public interface folderServiceClient {

    @GetMapping("/api/folder")
    List<Map<String, Object>> getAllFolder();

    @GetMapping("/api/folder/parent/{parentId}")
    List<Map<String, Object>> getAllFilesByParent(
            @PathVariable("parentId") Long parentId);

}
