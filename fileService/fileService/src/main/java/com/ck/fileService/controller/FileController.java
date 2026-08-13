package com.ck.fileService.controller;

import com.ck.fileService.models.FileEntity;
import com.ck.fileService.repository.FileRepository;
import com.ck.fileService.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/files")
public class FileController {
    @Autowired
    private FileRepository fileRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ USE ABSOLUTE PATH INSTEAD OF RELATIVE
    private static final String UPLOAD_DIR = System.getProperty("user.home") + File.separator + "fileservice_uploads";

    @GetMapping
    public List<FileEntity> getALLFiles(HttpServletRequest request){
        Long userId = requireUserId(request);
        return fileRepository.findByUserId(userId);
    }

    @GetMapping("/{id}")
    public FileEntity getFilebyId(@PathVariable Long id, HttpServletRequest request){
        Long userId = requireUserId(request);
        return fileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("file not found"));
    }

    @PostMapping
    public FileEntity createFile(@RequestBody FileEntity file, HttpServletRequest request){
        file.setUserId(requireUserId(request));
        return fileRepository.save(file);
    }

    @DeleteMapping("/{id}")
    public void deleteFile(@PathVariable Long id, HttpServletRequest request){
        Long userId = requireUserId(request);
        fileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("file not found"));
        fileRepository.deleteById(id);
    }

    @GetMapping("/folder/{folderId}")
    public List<FileEntity> getFilesByFolder(@PathVariable Long folderId, HttpServletRequest request)
    {
        Long userId = requireUserId(request);
        return fileRepository.findByUserIdAndFolderId(userId, folderId);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam(value = "name", required = false) String name,
            HttpServletRequest request) {

        try {

            Long userId = requireUserId(request);

            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                        Map.of(
                                "success", false,
                                "error", "Please select a file"
                        )
                );
            }

            // Validate folder only if folderId is provided
            if (folderId != null) {

                RestTemplate restTemplate = new RestTemplate();
                String folderServiceUrl = "http://localhost:8082/api/folder/" + folderId;

                try {
                    var requestEntity = new org.springframework.http.HttpEntity<String>(
                            org.springframework.http.HttpHeaders.EMPTY);
                    String authHeader = request.getHeader("Authorization");
                    if (authHeader != null) {
                        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                        headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                        requestEntity = new org.springframework.http.HttpEntity<>(headers);
                    }
                    restTemplate.exchange(folderServiceUrl, org.springframework.http.HttpMethod.GET,
                            requestEntity, Object.class);
                } catch (Exception e) {
                    System.out.println(" Folder validation failed: " + e.getMessage());
                    return ResponseEntity.badRequest().body(
                            Map.of(
                                    "success", false,
                                    "error", "Folder not found"
                            )
                    );
                }
            }

            String originalFilename = file.getOriginalFilename();

            if (originalFilename == null || originalFilename.isBlank()) {
                originalFilename = "unknown_file";
            }

            String displayName =
                    (name != null && !name.isBlank())
                            ? name
                            : originalFilename;

            System.out.println("📝 Uploading file: " + originalFilename);
            System.out.println("📝 Display name: " + displayName);
            System.out.println("📝 File size: " + file.getSize() + " bytes");

            // Save metadata
            FileEntity entity = new FileEntity();

            entity.setName(displayName);
            entity.setOriginalName(originalFilename);
            entity.setFolderId(folderId);
            entity.setUserId(userId);
            entity.setContentType(file.getContentType());
            entity.setSize(file.getSize());
            entity.setPath("");

            entity = fileRepository.save(entity);
            System.out.println("✅ File entity saved to DB with ID: " + entity.getId());

            // Create upload directory
            Path uploadFolder = Paths.get(UPLOAD_DIR);

            if (!Files.exists(uploadFolder)) {
                try {
                    Files.createDirectories(uploadFolder);
                    System.out.println("✅ Created upload directory: " + uploadFolder.toAbsolutePath());
                } catch (Exception e) {
                    System.out.println("❌ Failed to create directory: " + e.getMessage());
                    throw e;
                }
            } else {
                System.out.println("✅ Upload directory already exists: " + uploadFolder.toAbsolutePath());
            }

            // Store file using database id
            String extension = getFileExtension(originalFilename);

            String storedFileName = entity.getId() + extension;
            Path filePath = uploadFolder.resolve(storedFileName);

            System.out.println("📁 Storing file at: " + filePath.toAbsolutePath());

            try {
                Files.copy(
                        file.getInputStream(),
                        filePath,
                        java.nio.file.StandardCopyOption.REPLACE_EXISTING
                );
                System.out.println("✅ File successfully written to disk");
            } catch (Exception e) {
                System.out.println("❌ Failed to write file to disk: " + e.getMessage());
                e.printStackTrace();
                throw e;
            }

            // Verify file was written
            if (Files.exists(filePath)) {
                long fileSize = Files.size(filePath);
                System.out.println("✅ File verified on disk. Size: " + fileSize + " bytes");
            } else {
                System.out.println("❌ File not found after write!");
            }

            entity.setPath(filePath.toAbsolutePath().toString());

            entity = fileRepository.save(entity);

            System.out.println("✅ Upload completed successfully!");

            return ResponseEntity.ok(entity);

        }catch (Exception e) {
            System.out.println("❌ Upload failed with exception: " + e.getMessage());
            e.printStackTrace();

            Throwable t = e;
            while (t.getCause() != null) {
                t = t.getCause();
            }

            return ResponseEntity.internalServerError().body(
                    Map.of(
                            "success", false,
                            "error", t.getMessage()
                    )
            );
        }
    }

    @PutMapping("/rename/{id}")
    public ResponseEntity<?> renameFile(@PathVariable Long id, @RequestParam String newName, HttpServletRequest request) {

        try {
            Long userId = requireUserId(request);

            FileEntity file = fileRepository.findByIdAndUserId(id, userId)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            Path oldPath = Paths.get(file.getPath());
            String extension = getFileExtension(file.getOriginalName());

            Path newPath = oldPath.resolveSibling(newName + extension);

            Files.move(oldPath, newPath);

            file.setName(newName);
            file.setPath(newPath.toString());

            fileRepository.save(file);

            return ResponseEntity.ok(file);

        } catch (Exception e) {

            return ResponseEntity.internalServerError().body(e.getMessage());

        }
    }

    @PostMapping("/move")
    public ResponseEntity<?> moveFiles(@RequestBody Map<String, Object> request, HttpServletRequest servletRequest) {
        try {
            Long userId = requireUserId(servletRequest);
            Object fileIdsRaw = request.get("fileIds");
            Object targetFolderIdRaw = request.get("targetFolderId");

            if (!(fileIdsRaw instanceof List<?> fileIds) || fileIds.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "fileIds are required"));
            }
            if (!(targetFolderIdRaw instanceof Number target)) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "error", "targetFolderId is required"));
            }
            Long targetFolderId = target.longValue();

            int moved = 0;
            for (Object o : fileIds) {
                if (!(o instanceof Number fileIdNum)) continue;
                Optional<FileEntity> optFile = fileRepository.findByIdAndUserId(fileIdNum.longValue(), userId);
                if (optFile.isPresent()) {
                    FileEntity file = optFile.get();
                    file.setFolderId(targetFolderId);
                    fileRepository.save(file);
                    moved++;
                }
            }

            return ResponseEntity.ok(Map.of("success", true, "moved", moved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadFile(@PathVariable Long id, HttpServletRequest request){
        try {
            Long userId = requireUserId(request);
            FileEntity file = fileRepository.findByIdAndUserId(id, userId).orElse(null);
            if(file==null) {
                System.out.println("❌ File with ID " + id + " not found in database");
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "error", "File not found in database")
                );
            }

            System.out.println("📥 Downloading file ID: " + id);
            System.out.println("📥 File path from DB: " + file.getPath());

            Path filePath = Paths.get(file.getPath());

            if(!Files.exists(filePath)) {
                System.out.println("❌ File not found on disk at: " + filePath.toAbsolutePath());
                return ResponseEntity.status(404).body(
                        Map.of("success", false, "error", "File not found on disk at: " + filePath.toAbsolutePath().toString())
                );
            }

            System.out.println("✅ File found on disk");
            byte[] fileContent = Files.readAllBytes(filePath);
            System.out.println("✅ File read successfully. Size: " + fileContent.length + " bytes");

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                    .header(HttpHeaders.CONTENT_TYPE, file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE)
                    .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(fileContent.length))
                    .body(fileContent);
        } catch (IOException e) {
            System.out.println("❌ Download failed with IOException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    Map.of("success", false, "error", "Error downloading file: " + e.getMessage())
            );
        }
    }

    /**
     * Resolves the authenticated user's id or throws 401 when missing.
     */
    private Long requireUserId(HttpServletRequest request) {
        Long userId = jwtUtil.getUserId(request);
        if (userId == null) {
            throw new UnauthorizedException("Missing or invalid access token");
        }
        return userId;
    }

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    static class UnauthorizedException extends RuntimeException {
        UnauthorizedException(String message) {
            super(message);
        }
    }

    // ✅ Helper method to extract file extension
    private String getFileExtension(String filename) {
        if (filename == null || filename.isBlank()) {
            return "";
        }
        int dot = filename.lastIndexOf(".");
        return dot != -1 ? filename.substring(dot) : "";
    }
}
