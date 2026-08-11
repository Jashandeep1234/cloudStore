package com.ck.searchService.controller;


import com.ck.searchService.client.fileServiceClient;
import com.ck.searchService.client.folderServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
public class SearchController {

    @Autowired
    private fileServiceClient fileServiceClient;

    @Autowired
    private folderServiceClient folderServiceClient;

    @GetMapping
    public Map<String, Object> search(@RequestParam String query) {

        List<Map<String, Object>> allFiles =
                fileServiceClient.getAllFiles();

        List<Map<String, Object>> allFolders =
                folderServiceClient.getAllFolder();

        List<Map<String, Object>> fileResult =
                allFiles.stream()
                        .filter(file ->
                                file.get("name")
                                        .toString()
                                        .toLowerCase()
                                        .contains(query.toLowerCase()))
                        .toList();

        List<Map<String, Object>> folderResult =
                allFolders.stream()
                        .filter(folder ->
                                folder.get("name")
                                        .toString()
                                        .toLowerCase()
                                        .contains(query.toLowerCase()))
                        .toList();

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("query", query);
        response.put("totalFiles", fileResult.size());
        response.put("totalFolders", folderResult.size());
        response.put("files", fileResult);
        response.put("folders", folderResult);

        return response;
    }

    @GetMapping("/files")
    public List<Map<String, Object>> searchFiles(
            @RequestParam String query) {

        return fileServiceClient.getAllFiles()
                .stream()
                .filter(file ->
                        file.get("name")
                                .toString()
                                .toLowerCase()
                                .contains(query.toLowerCase()))
                .toList();
    }

    @GetMapping("/folders")
    public List<Map<String, Object>> searchFolders(
            @RequestParam String query) {

        return folderServiceClient.getAllFolder()
                .stream()
                .filter(folder ->
                        folder.get("name")
                                .toString()
                                .toLowerCase()
                                .contains(query.toLowerCase()))
                .toList();
    }

}