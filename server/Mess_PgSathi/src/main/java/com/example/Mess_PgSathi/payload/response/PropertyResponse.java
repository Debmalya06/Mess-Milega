package com.example.Mess_PgSathi.payload.response;

import com.example.Mess_PgSathi.model.Property;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropertyResponse {
    
    private String id;
    private String name;
    private String description;
    private String propertyType;
    private String address;
    private String city;
    private String state;
    private String pinCode;
    private Double latitude;
    private Double longitude;
    
    // Owner Information
    private String ownerId;
    private String ownerName;
    private String ownerPhone;
    private String ownerEmail;
    
    // Property Details
    private Integer totalRooms;
    private Integer availableRooms;
    private Double monthlyRent;
    private Double securityDeposit;
    
    // Room and Preference Details
    private String roomType;
    private String genderPreference;
    
    // Amenities
    private boolean wifi;
    private boolean parking;
    private boolean meals;
    private boolean laundry;
    private boolean ac;
    private boolean tv;
    private boolean gym;
    private boolean security;
    private boolean powerBackup;
    private boolean housekeeping;
    
    // Additional Information
    private String nearbyLandmarks;
    private String rulesAndRegulations;
    private Double distanceFromCollege;
    private String collegeNearby;
    
    // Images
    private List<String> imageUrls;
    
    // Status and Timestamps
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Rating and Reviews
    private Double averageRating;
    private Integer totalReviews;
    
    // Convert from Property entity to PropertyResponse
    public static PropertyResponse fromProperty(Property property) {
        PropertyResponse response = new PropertyResponse();
        response.setId(property.getId());
        response.setName(property.getName());
        response.setDescription(property.getDescription());
        response.setPropertyType(property.getPropertyType().getDisplayName());
        response.setAddress(property.getAddress());
        response.setCity(property.getCity());
        response.setState(property.getState());
        response.setPinCode(property.getPinCode());
        response.setLatitude(property.getLatitude());
        response.setLongitude(property.getLongitude());
        
        response.setOwnerId(property.getOwnerId());
        response.setOwnerName(property.getOwnerName());
        response.setOwnerPhone(property.getOwnerPhone());
        response.setOwnerEmail(property.getOwnerEmail());
        
        response.setTotalRooms(property.getTotalRooms());
        response.setAvailableRooms(property.getAvailableRooms());
        response.setMonthlyRent(property.getMonthlyRent());
        response.setSecurityDeposit(property.getSecurityDeposit());
        
        response.setRoomType(property.getRoomType().getDisplayName());
        response.setGenderPreference(property.getGenderPreference().getDisplayName());
        
        response.setWifi(property.isWifi());
        response.setParking(property.isParking());
        response.setMeals(property.isMeals());
        response.setLaundry(property.isLaundry());
        response.setAc(property.isAc());
        response.setTv(property.isTv());
        response.setGym(property.isGym());
        response.setSecurity(property.isSecurity());
        response.setPowerBackup(property.isPowerBackup());
        response.setHousekeeping(property.isHousekeeping());
        
        response.setNearbyLandmarks(property.getNearbyLandmarks());
        response.setRulesAndRegulations(property.getRulesAndRegulations());
        response.setDistanceFromCollege(property.getDistanceFromCollege());
        response.setCollegeNearby(property.getCollegeNearby());
        
        response.setImageUrls(property.getImageUrls());
        response.setStatus(property.getStatus().toString());
        response.setCreatedAt(property.getCreatedAt());
        response.setUpdatedAt(property.getUpdatedAt());
        response.setAverageRating(property.getAverageRating());
        response.setTotalReviews(property.getTotalReviews());
        
        return response;
    }
}
