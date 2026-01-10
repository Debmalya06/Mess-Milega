package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    private String id;

    @NotBlank(message = "Property name is required")
    private String name;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "PIN code is required")
    private String pinCode;

    private Double latitude;
    private Double longitude;

    // Owner Information
    @NotBlank(message = "Owner ID is required")
    private String ownerId;

    @NotBlank(message = "Owner name is required")
    private String ownerName;

    @NotBlank(message = "Owner phone is required")
    private String ownerPhone;

    @Email(message = "Valid owner email is required")
    private String ownerEmail;

    // Property Details
    @Min(value = 1, message = "Total rooms must be at least 1")
    private Integer totalRooms;

    @Min(value = 0, message = "Available rooms cannot be negative")
    private Integer availableRooms;

    @DecimalMin(value = "0.0", message = "Monthly rent must be positive")
    private Double monthlyRent;

    @DecimalMin(value = "0.0", message = "Security deposit must be positive")
    private Double securityDeposit;

    // Room and Preference Details
    @NotNull(message = "Room type is required")
    private RoomType roomType;

    @NotNull(message = "Gender preference is required")
    private GenderPreference genderPreference;

    // Amenities (matching your UI filters)
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
    private Double distanceFromCollege; // in KM
    private String collegeNearby;

    // Images
    private List<String> imageUrls;

    // Status and Timestamps
    @NotNull
    private PropertyStatus status = PropertyStatus.ACTIVE;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Rating and Reviews
    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    // Enums
    public enum PropertyType {
        PG("PG"),
        HOSTEL("Hostel"),
        SHARED_APARTMENT("Shared Apartment"),
        INDEPENDENT_ROOM("Independent Room");

        private final String displayName;

        PropertyType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum RoomType {
        SINGLE("Single"),
        DOUBLE("Double"),
        TRIPLE("Triple"),
        DORMITORY("Dormitory");

        private final String displayName;

        RoomType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum GenderPreference {
        MALE("Male Only"),
        FEMALE("Female Only"),
        UNISEX("Any");

        private final String displayName;

        GenderPreference(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum PropertyStatus {
        ACTIVE, INACTIVE, PENDING_APPROVAL, BLOCKED
    }
}
