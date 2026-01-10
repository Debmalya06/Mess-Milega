package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    private String id;

    // Property Information
    private String propertyId;
    private String propertyName;

    // Reviewer (Seeker) Information
    private String reviewerId;
    private String reviewerName;
    private String reviewerProfileImage;

    // Owner Information
    private String ownerId;
    private String ownerName;

    // Booking Reference (must have stayed to review)
    private String bookingId;

    // Rating (1-5 stars)
    private int overallRating; // 1 to 5
    private int cleanlinessRating;
    private int locationRating;
    private int amenitiesRating;
    private int valueForMoneyRating;
    private int ownerBehaviorRating;

    // Review Content
    private String title;
    private String reviewText;
    private List<String> pros = new ArrayList<>(); // Things seeker liked
    private List<String> cons = new ArrayList<>(); // Things seeker didn't like
    private List<String> images = new ArrayList<>(); // Review images

    // Stay Information
    private int stayDurationMonths;
    private String stayPeriod; // e.g., "Jan 2025 - Mar 2025"

    // Would Recommend
    private boolean wouldRecommend = true;

    // Status
    private ReviewStatus status = ReviewStatus.PENDING;

    // Owner Response
    private String ownerResponse;
    private LocalDateTime ownerRespondedAt;

    // Helpful Votes
    private int helpfulCount = 0;
    private List<String> helpfulVoterIds = new ArrayList<>();

    // Report
    private boolean reported = false;
    private String reportReason;
    private String reportedBy;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum ReviewStatus {
        PENDING,    // Awaiting moderation
        APPROVED,   // Published
        REJECTED,   // Rejected by admin
        HIDDEN      // Hidden due to reports
    }

    // Calculate average rating
    public double getAverageRating() {
        int totalRatings = cleanlinessRating + locationRating + amenitiesRating 
                         + valueForMoneyRating + ownerBehaviorRating;
        return Math.round((totalRatings / 5.0) * 10.0) / 10.0;
    }
}
