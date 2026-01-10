package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Booking;
import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.Review;
import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.repository.BookingRepository;
import com.example.Mess_PgSathi.repository.PropertyRepository;
import com.example.Mess_PgSathi.repository.ReviewRepository;
import com.example.Mess_PgSathi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    /**
     * Write a review for a property (must have completed or active booking)
     */
    public Review writeReview(String reviewerId, String propertyId, String bookingId,
                              int overallRating, int cleanlinessRating, int locationRating,
                              int amenitiesRating, int valueForMoneyRating, int ownerBehaviorRating,
                              String title, String reviewText, List<String> pros, List<String> cons,
                              List<String> images, boolean wouldRecommend, int stayDurationMonths, String stayPeriod) {
        
        // Verify reviewer exists
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Verify property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found!"));

        // Verify booking exists and belongs to reviewer
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (!booking.getSeekerId().equals(reviewerId)) {
            throw new RuntimeException("You can only review properties you have booked!");
        }

        // Check if booking is active or completed
        if (booking.getStatus() != Booking.BookingStatus.ACTIVE && 
            booking.getStatus() != Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("You can only review after your booking is active or completed!");
        }

        // Check if already reviewed this booking
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new RuntimeException("You have already reviewed this booking!");
        }

        // Validate ratings (1-5)
        validateRating(overallRating, "Overall rating");
        validateRating(cleanlinessRating, "Cleanliness rating");
        validateRating(locationRating, "Location rating");
        validateRating(amenitiesRating, "Amenities rating");
        validateRating(valueForMoneyRating, "Value for money rating");
        validateRating(ownerBehaviorRating, "Owner behavior rating");

        Review review = new Review();
        review.setPropertyId(propertyId);
        review.setPropertyName(property.getName());
        review.setReviewerId(reviewerId);
        review.setReviewerName(reviewer.getFullName());
        review.setOwnerId(property.getOwnerId());
        review.setOwnerName(property.getOwnerName());
        review.setBookingId(bookingId);

        review.setOverallRating(overallRating);
        review.setCleanlinessRating(cleanlinessRating);
        review.setLocationRating(locationRating);
        review.setAmenitiesRating(amenitiesRating);
        review.setValueForMoneyRating(valueForMoneyRating);
        review.setOwnerBehaviorRating(ownerBehaviorRating);

        review.setTitle(title);
        review.setReviewText(reviewText);
        review.setPros(pros != null ? pros : List.of());
        review.setCons(cons != null ? cons : List.of());
        review.setImages(images != null ? images : List.of());

        review.setWouldRecommend(wouldRecommend);
        review.setStayDurationMonths(stayDurationMonths);
        review.setStayPeriod(stayPeriod);

        review.setStatus(Review.ReviewStatus.APPROVED); // Auto-approve for now
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        // Update property average rating
        updatePropertyRating(propertyId);

        return savedReview;
    }

    /**
     * Owner responds to a review
     */
    public Review respondToReview(String reviewId, String ownerId, String response) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found!"));

        if (!review.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to respond to this review!");
        }

        if (review.getOwnerResponse() != null) {
            throw new RuntimeException("You have already responded to this review!");
        }

        review.setOwnerResponse(response);
        review.setOwnerRespondedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * Mark review as helpful
     */
    public Review markHelpful(String reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found!"));

        if (review.getHelpfulVoterIds().contains(userId)) {
            throw new RuntimeException("You have already marked this review as helpful!");
        }

        review.getHelpfulVoterIds().add(userId);
        review.setHelpfulCount(review.getHelpfulCount() + 1);
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * Report a review
     */
    public Review reportReview(String reviewId, String reporterId, String reason) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found!"));

        review.setReported(true);
        review.setReportReason(reason);
        review.setReportedBy(reporterId);
        review.setUpdatedAt(LocalDateTime.now());

        return reviewRepository.save(review);
    }

    /**
     * Get review by ID
     */
    public Review getReviewById(String reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found!"));
    }

    /**
     * Get all reviews for a property
     */
    public List<Review> getPropertyReviews(String propertyId) {
        return reviewRepository.findByPropertyIdAndStatus(propertyId, Review.ReviewStatus.APPROVED);
    }

    /**
     * Get all reviews by a reviewer
     */
    public List<Review> getReviewerReviews(String reviewerId) {
        return reviewRepository.findByReviewerIdOrderByCreatedAtDesc(reviewerId);
    }

    /**
     * Get all reviews for owner's properties
     */
    public List<Review> getOwnerPropertyReviews(String ownerId) {
        return reviewRepository.findByOwnerIdAndStatus(ownerId, Review.ReviewStatus.APPROVED);
    }

    /**
     * Get property rating summary
     */
    public PropertyRatingSummary getPropertyRatingSummary(String propertyId) {
        List<Review> reviews = reviewRepository.findByPropertyIdAndStatus(propertyId, Review.ReviewStatus.APPROVED);
        
        if (reviews.isEmpty()) {
            return new PropertyRatingSummary(0, 0, 0, 0, 0, 0, 0, 0);
        }

        double avgOverall = reviews.stream().mapToInt(Review::getOverallRating).average().orElse(0);
        double avgCleanliness = reviews.stream().mapToInt(Review::getCleanlinessRating).average().orElse(0);
        double avgLocation = reviews.stream().mapToInt(Review::getLocationRating).average().orElse(0);
        double avgAmenities = reviews.stream().mapToInt(Review::getAmenitiesRating).average().orElse(0);
        double avgValueForMoney = reviews.stream().mapToInt(Review::getValueForMoneyRating).average().orElse(0);
        double avgOwnerBehavior = reviews.stream().mapToInt(Review::getOwnerBehaviorRating).average().orElse(0);

        return new PropertyRatingSummary(
                round(avgOverall),
                round(avgCleanliness),
                round(avgLocation),
                round(avgAmenities),
                round(avgValueForMoney),
                round(avgOwnerBehavior),
                reviews.size(),
                reviews.stream().filter(Review::isWouldRecommend).count()
        );
    }

    /**
     * Update property's average rating
     */
    private void updatePropertyRating(String propertyId) {
        PropertyRatingSummary summary = getPropertyRatingSummary(propertyId);
        Property property = propertyRepository.findById(propertyId).orElse(null);
        
        if (property != null) {
            // If Property model has rating fields, update them here
            property.setUpdatedAt(LocalDateTime.now());
            propertyRepository.save(property);
        }
    }

    // Helper methods
    private void validateRating(int rating, String fieldName) {
        if (rating < 1 || rating > 5) {
            throw new RuntimeException(fieldName + " must be between 1 and 5!");
        }
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    public static class PropertyRatingSummary {
        public final double averageOverall;
        public final double averageCleanliness;
        public final double averageLocation;
        public final double averageAmenities;
        public final double averageValueForMoney;
        public final double averageOwnerBehavior;
        public final int totalReviews;
        public final long recommendCount;

        public PropertyRatingSummary(double averageOverall, double averageCleanliness, double averageLocation,
                                    double averageAmenities, double averageValueForMoney, double averageOwnerBehavior,
                                    int totalReviews, long recommendCount) {
            this.averageOverall = averageOverall;
            this.averageCleanliness = averageCleanliness;
            this.averageLocation = averageLocation;
            this.averageAmenities = averageAmenities;
            this.averageValueForMoney = averageValueForMoney;
            this.averageOwnerBehavior = averageOwnerBehavior;
            this.totalReviews = totalReviews;
            this.recommendCount = recommendCount;
        }
    }
}
