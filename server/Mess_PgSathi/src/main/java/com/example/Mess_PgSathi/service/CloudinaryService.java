package com.example.Mess_PgSathi.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload a single image to Cloudinary
     * @param file The image file to upload
     * @param folder The folder name in Cloudinary (e.g., "properties", "profiles")
     * @return The secure URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }

        // Validate file size (max 10MB)
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size cannot exceed 10MB");
        }

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "mess_pg_sathi/" + folder,
                            "resource_type", "image",
                            "transformation", ObjectUtils.asMap(
                                    "quality", "auto:good",
                                    "fetch_format", "auto"
                            )
                    ));

            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("Image uploaded successfully: {}", secureUrl);
            return secureUrl;

        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary: {}", e.getMessage());
            throw new IOException("Failed to upload image: " + e.getMessage());
        }
    }

    /**
     * Upload multiple images to Cloudinary
     * @param files List of image files to upload
     * @param folder The folder name in Cloudinary
     * @return List of secure URLs of the uploaded images
     */
    public List<String> uploadImages(List<MultipartFile> files, String folder) throws IOException {
        if (files == null || files.isEmpty()) {
            return new ArrayList<>();
        }

        // Limit maximum number of images
        if (files.size() > 10) {
            throw new IllegalArgumentException("Maximum 10 images allowed");
        }

        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String url = uploadImage(file, folder);
                imageUrls.add(url);
            }
        }
        return imageUrls;
    }

    /**
     * Delete an image from Cloudinary by URL
     * @param imageUrl The URL of the image to delete
     * @return true if deletion was successful
     */
    public boolean deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) {
            return false;
        }

        try {
            // Extract public ID from URL
            String publicId = extractPublicId(imageUrl);
            if (publicId == null) {
                log.warn("Could not extract public ID from URL: {}", imageUrl);
                return false;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            String deleteResult = (String) result.get("result");
            
            boolean success = "ok".equals(deleteResult);
            if (success) {
                log.info("Image deleted successfully: {}", publicId);
            } else {
                log.warn("Failed to delete image: {}", publicId);
            }
            return success;

        } catch (Exception e) {
            log.error("Error deleting image: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Delete multiple images from Cloudinary
     * @param imageUrls List of image URLs to delete
     */
    public void deleteImages(List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return;
        }

        for (String url : imageUrls) {
            deleteImage(url);
        }
    }

    /**
     * Extract public ID from Cloudinary URL
     * Example URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/mess_pg_sathi/properties/abc123.jpg
     * Returns: mess_pg_sathi/properties/abc123
     */
    private String extractPublicId(String url) {
        try {
            // Remove the file extension
            int lastDotIndex = url.lastIndexOf('.');
            String urlWithoutExtension = lastDotIndex > 0 ? url.substring(0, lastDotIndex) : url;

            // Find the upload path
            String uploadMarker = "/upload/";
            int uploadIndex = urlWithoutExtension.indexOf(uploadMarker);
            if (uploadIndex == -1) {
                return null;
            }

            // Get everything after /upload/vXXXX/
            String afterUpload = urlWithoutExtension.substring(uploadIndex + uploadMarker.length());
            
            // Skip version number if present (v followed by digits)
            if (afterUpload.startsWith("v") && afterUpload.length() > 1) {
                int slashIndex = afterUpload.indexOf('/');
                if (slashIndex > 0) {
                    afterUpload = afterUpload.substring(slashIndex + 1);
                }
            }

            return afterUpload;
        } catch (Exception e) {
            log.error("Error extracting public ID from URL: {}", url);
            return null;
        }
    }
}
