package com.example.Mess_PgSathi.payload.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class ReviewRequest {
    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Booking ID is required")
    private String bookingId;

    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating cannot exceed 5")
    private int overallRating;

    @Min(1) @Max(5)
    private int cleanlinessRating;

    @Min(1) @Max(5)
    private int locationRating;

    @Min(1) @Max(5)
    private int amenitiesRating;

    @Min(1) @Max(5)
    private int valueForMoneyRating;

    @Min(1) @Max(5)
    private int ownerBehaviorRating;

    @NotBlank(message = "Review title is required")
    private String title;

    @NotBlank(message = "Review text is required")
    private String reviewText;

    private List<String> pros;
    private List<String> cons;
    private List<String> images;

    private boolean wouldRecommend = true;
    private int stayDurationMonths;
    private String stayPeriod;
}
