package com.example.Mess_PgSathi.payload.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class AddPropertyRequest {
    
    @NotBlank(message = "Property name is required")
    @Size(min = 3, max = 100, message = "Property name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotBlank(message = "Property type is required")
    @Pattern(regexp = "^(PG|HOSTEL|SHARED_APARTMENT|INDEPENDENT_ROOM)$", 
             message = "Property type must be PG, HOSTEL, SHARED_APARTMENT, or INDEPENDENT_ROOM")
    private String propertyType;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City name must be between 2 and 50 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50, message = "State name must be between 2 and 50 characters")
    private String state;

    @NotBlank(message = "PIN code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "PIN code must be 6 digits")
    private String pinCode;

    private Double latitude;
    private Double longitude;

    // Property Details
    @NotNull(message = "Total rooms is required")
    @Min(value = 1, message = "Total rooms must be at least 1")
    @Max(value = 100, message = "Total rooms cannot exceed 100")
    private Integer totalRooms;

    @NotNull(message = "Available rooms is required")
    @Min(value = 0, message = "Available rooms cannot be negative")
    private Integer availableRooms;

    @NotNull(message = "Monthly rent is required")
    @DecimalMin(value = "500.0", message = "Monthly rent must be at least ₹500")
    @DecimalMax(value = "100000.0", message = "Monthly rent cannot exceed ₹1,00,000")
    private Double monthlyRent;

    @NotNull(message = "Security deposit is required")
    @DecimalMin(value = "0.0", message = "Security deposit must be positive")
    private Double securityDeposit;

    // Room and Preference Details
    @NotBlank(message = "Room type is required")
    @Pattern(regexp = "^(SINGLE|DOUBLE|TRIPLE|DORMITORY)$", 
             message = "Room type must be SINGLE, DOUBLE, TRIPLE, or DORMITORY")
    private String roomType;

    @NotBlank(message = "Gender preference is required")
    @Pattern(regexp = "^(MALE|FEMALE|UNISEX)$", 
             message = "Gender preference must be MALE, FEMALE, or UNISEX")
    private String genderPreference;

    // Amenities (matching your UI)
    private boolean wifi = false;
    private boolean parking = false;
    private boolean meals = false;
    private boolean laundry = false;
    private boolean ac = false;
    private boolean tv = false;
    private boolean gym = false;
    private boolean security = false;
    private boolean powerBackup = false;
    private boolean housekeeping = false;

    // Additional Information
    private String nearbyLandmarks;
    private String rulesAndRegulations;
    
    @DecimalMin(value = "0.0", message = "Distance from college must be positive")
    @DecimalMax(value = "50.0", message = "Distance from college cannot exceed 50 KM")
    private Double distanceFromCollege; // in KM
    
    private String collegeNearby;

    // Images (URLs or file paths)
    @Size(max = 10, message = "Maximum 10 images allowed")
    private List<String> imageUrls;
}
