package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "user_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserPreference {
    @Id
    private String id;

    // User Reference
    private String userId;
    private String userEmail;

    // Location Preferences
    private List<String> preferredCities = new ArrayList<>();
    private List<String> preferredAreas = new ArrayList<>(); // Localities within city
    private String preferredState;
    private Double maxDistanceFromCollege; // in km
    private String collegeOrWorkplace;
    private String collegeOrWorkplaceAddress;

    // Budget Preferences
    private Double minBudget;
    private Double maxBudget;
    private boolean includeSecurityDeposit = true; // Consider deposit in budget

    // Property Preferences
    private Property.PropertyType preferredPropertyType; // PG, MESS, HOSTEL
    private Property.RoomType preferredRoomType; // SINGLE, DOUBLE, TRIPLE, DORMITORY
    private Property.GenderPreference genderPreference;

    // Amenity Preferences (must have)
    private boolean needWifi = false;
    private boolean needParking = false;
    private boolean needMeals = false;
    private boolean needLaundry = false;
    private boolean needAc = false;
    private boolean needTv = false;
    private boolean needGym = false;
    private boolean needSecurity = false;
    private boolean needPowerBackup = false;
    private boolean needHousekeeping = false;

    // Move-in Details
    private String expectedMoveInDate; // IMMEDIATE, WITHIN_WEEK, WITHIN_MONTH, FLEXIBLE
    private int expectedStayMonths; // Expected duration of stay

    // Lifestyle Preferences
    private boolean vegetarianOnly = false;
    private boolean nonSmoker = false;
    private boolean noPets = false;
    private boolean quietEnvironment = false;
    private String workSchedule; // DAY, NIGHT, FLEXIBLE

    // Notification Preferences
    private boolean emailNotifications = true;
    private boolean smsNotifications = false;
    private boolean pushNotifications = true;
    private boolean notifyNewListings = true;
    private boolean notifyPriceDrops = true;

    // Search History (last 10 searches)
    private List<SearchHistory> recentSearches = new ArrayList<>();

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchHistory {
        private String searchQuery;
        private String city;
        private Double minPrice;
        private Double maxPrice;
        private LocalDateTime searchedAt;
    }
}
