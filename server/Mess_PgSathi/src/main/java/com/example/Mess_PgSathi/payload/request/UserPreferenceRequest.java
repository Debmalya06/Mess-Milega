package com.example.Mess_PgSathi.payload.request;

import lombok.Data;

import java.util.List;

@Data
public class UserPreferenceRequest {
    // Location Preferences
    private List<String> preferredCities;
    private List<String> preferredAreas;
    private String preferredState;
    private Double maxDistanceFromCollege;
    private String collegeOrWorkplace;
    private String collegeOrWorkplaceAddress;

    // Budget Preferences
    private Double minBudget;
    private Double maxBudget;
    private boolean includeSecurityDeposit = true;

    // Property Preferences
    private String preferredPropertyType; // PG, MESS, HOSTEL
    private String preferredRoomType; // SINGLE, DOUBLE, TRIPLE, DORMITORY
    private String genderPreference; // MALE, FEMALE, ANY

    // Amenity Preferences
    private boolean needWifi;
    private boolean needParking;
    private boolean needMeals;
    private boolean needLaundry;
    private boolean needAc;
    private boolean needTv;
    private boolean needGym;
    private boolean needSecurity;
    private boolean needPowerBackup;
    private boolean needHousekeeping;

    // Move-in Details
    private String expectedMoveInDate; // IMMEDIATE, WITHIN_WEEK, WITHIN_MONTH, FLEXIBLE
    private int expectedStayMonths;

    // Lifestyle Preferences
    private boolean vegetarianOnly;
    private boolean nonSmoker;
    private boolean noPets;
    private boolean quietEnvironment;
    private String workSchedule; // DAY, NIGHT, FLEXIBLE

    // Notification Preferences
    private boolean emailNotifications = true;
    private boolean smsNotifications;
    private boolean pushNotifications = true;
    private boolean notifyNewListings = true;
    private boolean notifyPriceDrops = true;
}
