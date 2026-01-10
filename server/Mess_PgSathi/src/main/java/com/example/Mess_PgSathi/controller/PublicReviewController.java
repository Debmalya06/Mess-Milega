package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.Review;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewService reviewService;

    /**
     * Get reviews for a property (Public)
     */
    @GetMapping("/property/{propertyId}")
    public ResponseEntity<?> getPropertyReviews(@PathVariable String propertyId) {
        try {
            List<Review> reviews = reviewService.getPropertyReviews(propertyId);
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get property rating summary (Public)
     */
    @GetMapping("/property/{propertyId}/summary")
    public ResponseEntity<?> getPropertyRatingSummary(@PathVariable String propertyId) {
        try {
            ReviewService.PropertyRatingSummary summary = reviewService.getPropertyRatingSummary(propertyId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get review by ID (Public)
     */
    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewById(@PathVariable String reviewId) {
        try {
            Review review = reviewService.getReviewById(reviewId);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
