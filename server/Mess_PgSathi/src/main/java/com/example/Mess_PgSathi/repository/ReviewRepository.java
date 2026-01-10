package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends MongoRepository<Review, String> {
    
    // Find by property
    List<Review> findByPropertyId(String propertyId);
    List<Review> findByPropertyIdAndStatus(String propertyId, Review.ReviewStatus status);
    List<Review> findByPropertyIdOrderByCreatedAtDesc(String propertyId);
    
    // Find by reviewer
    List<Review> findByReviewerId(String reviewerId);
    List<Review> findByReviewerIdOrderByCreatedAtDesc(String reviewerId);
    
    // Find by owner
    List<Review> findByOwnerId(String ownerId);
    List<Review> findByOwnerIdAndStatus(String ownerId, Review.ReviewStatus status);
    
    // Find by booking
    Optional<Review> findByBookingId(String bookingId);
    boolean existsByBookingId(String bookingId);
    
    // Check if user already reviewed property
    Optional<Review> findByReviewerIdAndPropertyId(String reviewerId, String propertyId);
    boolean existsByReviewerIdAndPropertyId(String reviewerId, String propertyId);
    
    // Find by status
    List<Review> findByStatus(Review.ReviewStatus status);
    
    // Find by rating
    List<Review> findByPropertyIdAndOverallRatingGreaterThanEqual(String propertyId, int rating);
    
    // Find reported reviews
    List<Review> findByReportedTrue();
    
    // Count methods
    long countByPropertyId(String propertyId);
    long countByPropertyIdAndStatus(String propertyId, Review.ReviewStatus status);
    long countByOwnerId(String ownerId);
    long countByReviewerId(String reviewerId);
}
