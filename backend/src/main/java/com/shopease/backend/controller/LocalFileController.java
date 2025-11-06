package com.shopease.backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.nio.file.*;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@RestController
@RequestMapping("/api/files")
public class LocalFileController {

    private final Path root = Paths.get(System.getProperty("user.dir"), "uploads", "images");

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, String> upload(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) throw new ResponseStatusException(BAD_REQUEST, "Empty file");
            if (file.getSize() > 10 * 1024 * 1024) throw new ResponseStatusException(BAD_REQUEST, "File too large (max 10MB)");
            String ct = Optional.ofNullable(file.getContentType()).orElse("");
            if (!ct.startsWith("image/")) throw new ResponseStatusException(BAD_REQUEST, "Only image files are allowed");

            String origin = Optional.ofNullable(file.getOriginalFilename()).orElse("image.jpg");
            String ext = origin.contains(".") ? origin.substring(origin.lastIndexOf(".")) : ".jpg";
            String name = UUID.randomUUID().toString().replace("-", "") + ext;

            Files.createDirectories(root);
            Files.copy(file.getInputStream(), root.resolve(name), StandardCopyOption.REPLACE_EXISTING);

            String baseUrl = "http://localhost:8080"; 
            return Map.of("url", baseUrl + "/images/" + name);

        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new ResponseStatusException(INTERNAL_SERVER_ERROR, "Upload failed");
        }
    }
}
