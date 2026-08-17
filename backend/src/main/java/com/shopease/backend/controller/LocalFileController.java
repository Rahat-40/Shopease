package com.shopease.backend.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

@RestController
@RequestMapping("/api/files")
public class LocalFileController {

    private final Cloudinary cloudinary;

    public LocalFileController(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> upload(
            @RequestParam("file") MultipartFile file
    ) {

        try {

            // -------------------------------------------------
            // Validate file
            // -------------------------------------------------

            if (file == null || file.isEmpty()) {
                throw new ResponseStatusException(
                        BAD_REQUEST,
                        "Empty file"
                );
            }

            if (file.getSize() > 10 * 1024 * 1024) {
                throw new ResponseStatusException(
                        BAD_REQUEST,
                        "File too large (max 10MB)"
                );
            }

            String contentType = file.getContentType();

            if (contentType == null ||
                    !contentType.startsWith("image/")) {

                throw new ResponseStatusException(
                        BAD_REQUEST,
                        "Only image files are allowed"
                );
            }

            // -------------------------------------------------
            // Upload to Cloudinary
            // -------------------------------------------------

            Map<?, ?> uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder", "shopease/products",
                                    "resource_type", "image",
                                    "unique_filename", true,
                                    "overwrite", false
                            )
                    );

            // -------------------------------------------------
            // Cloudinary secure URL
            // -------------------------------------------------

            String secureUrl =
                    (String) uploadResult.get("secure_url");

            if (secureUrl == null || secureUrl.isBlank()) {
                throw new RuntimeException(
                        "Cloudinary did not return an image URL"
                );
            }

            return Map.of(
                    "url", secureUrl
            );

        } catch (ResponseStatusException ex) {

            throw ex;

        } catch (Exception ex) {

            ex.printStackTrace();

            throw new ResponseStatusException(
                    INTERNAL_SERVER_ERROR,
                    "Image upload failed"
            );
        }
    }
}