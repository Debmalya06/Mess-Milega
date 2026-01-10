package com.example.Mess_PgSathi.payload.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryRequest {
    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message is required")
    private String message;

    private String inquiryType; // GENERAL, AVAILABILITY, PRICING, AMENITIES, VISIT_REQUEST, BOOKING_QUERY, OTHER
}
