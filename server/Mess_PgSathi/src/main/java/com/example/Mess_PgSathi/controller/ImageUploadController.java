package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
@Slf4j
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    /**
     * Upload a single image for property
     */
    @PostMapping("/upload")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
                                         @RequestParam(value = "folder", defaultValue = "properties") String folder) {
        try {
            String imageUrl = cloudinaryService.uploadImage(file, folder);
            
            Map<String, String> response = new HashMap<>();
            response.put("url", imageUrl);
            response.put("message", "Image uploaded successfully");
            
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading image: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to upload image"));
        }
    }

    /**
     * Upload multiple images for property
     */
    @PostMapping("/upload-multiple")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") List<MultipartFile> files,
                                                  @RequestParam(value = "folder", defaultValue = "properties") String folder) {
        try {
            List<String> imageUrls = cloudinaryService.uploadImages(files, folder);
            
            Map<String, Object> response = new HashMap<>();
            response.put("urls", imageUrls);
            response.put("count", imageUrls.size());
            response.put("message", "Images uploaded successfully");
            
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Error uploading images: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to upload images"));
        }
    }

    /**
     * Delete an image
     */
    @DeleteMapping("/delete")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            boolean deleted = cloudinaryService.deleteImage(imageUrl);
            
            if (deleted) {
                return ResponseEntity.ok(new MessageResponse("Image deleted successfully"));
            } else {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Failed to delete image"));
            }

        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(new MessageResponse("Error: Failed to delete image"));
        }
    }
}
