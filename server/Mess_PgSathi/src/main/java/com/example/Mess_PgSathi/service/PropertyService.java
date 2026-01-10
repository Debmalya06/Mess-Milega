package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.payload.request.AddPropertyRequest;
import com.example.Mess_PgSathi.payload.response.PropertyResponse;
import com.example.Mess_PgSathi.repository.PropertyRepository;
import com.example.Mess_PgSathi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /**
     * Add new property by owner
     */
    public PropertyResponse addProperty(AddPropertyRequest request, String ownerId) {
        // Verify owner exists and has PG_OWNER role
        Optional<User> ownerOpt = userRepository.findById(ownerId);
        if (ownerOpt.isEmpty()) {
            throw new RuntimeException("Owner not found!");
        }
        
        User owner = ownerOpt.get();
        if (!owner.getRole().equals(User.Role.PG_OWNER)) {
            throw new RuntimeException("Only PG owners can add properties!");
        }

        // Create new property
        Property property = new Property();
        property.setName(request.getName());
        property.setDescription(request.getDescription());
        property.setPropertyType(Property.PropertyType.valueOf(request.getPropertyType().toUpperCase()));
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPinCode(request.getPinCode());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());

        // Set owner information
        property.setOwnerId(ownerId);
        property.setOwnerName(owner.getFullName());
        property.setOwnerPhone(owner.getPhoneNumber());
        property.setOwnerEmail(owner.getEmail());

        // Set property details
        property.setTotalRooms(request.getTotalRooms());
        property.setAvailableRooms(request.getAvailableRooms());
        property.setMonthlyRent(request.getMonthlyRent());
        property.setSecurityDeposit(request.getSecurityDeposit());

        // Set room and preference details
        property.setRoomType(Property.RoomType.valueOf(request.getRoomType().toUpperCase()));
        property.setGenderPreference(Property.GenderPreference.valueOf(request.getGenderPreference().toUpperCase()));

        // Set amenities
        property.setWifi(request.isWifi());
        property.setParking(request.isParking());
        property.setMeals(request.isMeals());
        property.setLaundry(request.isLaundry());
        property.setAc(request.isAc());
        property.setTv(request.isTv());
        property.setGym(request.isGym());
        property.setSecurity(request.isSecurity());
        property.setPowerBackup(request.isPowerBackup());
        property.setHousekeeping(request.isHousekeeping());

        // Set additional information
        property.setNearbyLandmarks(request.getNearbyLandmarks());
        property.setRulesAndRegulations(request.getRulesAndRegulations());
        property.setDistanceFromCollege(request.getDistanceFromCollege());
        property.setCollegeNearby(request.getCollegeNearby());
        property.setImageUrls(request.getImageUrls());

        // Set timestamps and status
        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());
        property.setStatus(Property.PropertyStatus.ACTIVE);

        // Validate available rooms <= total rooms
        if (property.getAvailableRooms() > property.getTotalRooms()) {
            throw new RuntimeException("Available rooms cannot exceed total rooms!");
        }

        // Save property
        Property savedProperty = propertyRepository.save(property);
        return PropertyResponse.fromProperty(savedProperty);
    }

    /**
     * Get all properties by owner
     */
    public List<PropertyResponse> getPropertiesByOwner(String ownerId) {
        List<Property> properties = propertyRepository.findByOwnerId(ownerId);
        return properties.stream()
                .map(PropertyResponse::fromProperty)
                .collect(Collectors.toList());
    }

    /**
     * Get active properties by owner
     */
    public List<PropertyResponse> getActivePropertiesByOwner(String ownerId) {
        List<Property> properties = propertyRepository.findByOwnerIdAndStatus(ownerId, Property.PropertyStatus.ACTIVE);
        return properties.stream()
                .map(PropertyResponse::fromProperty)
                .collect(Collectors.toList());
    }

    /**
     * Get property by ID
     */
    public PropertyResponse getPropertyById(String propertyId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found!");
        }
        return PropertyResponse.fromProperty(propertyOpt.get());
    }

    /**
     * Update property
     */
    public PropertyResponse updateProperty(String propertyId, AddPropertyRequest request, String ownerId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found!");
        }

        Property property = propertyOpt.get();
        
        // Check if the owner is authorized to update this property
        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to update this property!");
        }

        // Update property details
        property.setName(request.getName());
        property.setDescription(request.getDescription());
        property.setPropertyType(Property.PropertyType.valueOf(request.getPropertyType().toUpperCase()));
        property.setAddress(request.getAddress());
        property.setCity(request.getCity());
        property.setState(request.getState());
        property.setPinCode(request.getPinCode());
        property.setLatitude(request.getLatitude());
        property.setLongitude(request.getLongitude());

        property.setTotalRooms(request.getTotalRooms());
        property.setAvailableRooms(request.getAvailableRooms());
        property.setMonthlyRent(request.getMonthlyRent());
        property.setSecurityDeposit(request.getSecurityDeposit());

        property.setRoomType(Property.RoomType.valueOf(request.getRoomType().toUpperCase()));
        property.setGenderPreference(Property.GenderPreference.valueOf(request.getGenderPreference().toUpperCase()));

        // Update amenities
        property.setWifi(request.isWifi());
        property.setParking(request.isParking());
        property.setMeals(request.isMeals());
        property.setLaundry(request.isLaundry());
        property.setAc(request.isAc());
        property.setTv(request.isTv());
        property.setGym(request.isGym());
        property.setSecurity(request.isSecurity());
        property.setPowerBackup(request.isPowerBackup());
        property.setHousekeeping(request.isHousekeeping());

        property.setNearbyLandmarks(request.getNearbyLandmarks());
        property.setRulesAndRegulations(request.getRulesAndRegulations());
        property.setDistanceFromCollege(request.getDistanceFromCollege());
        property.setCollegeNearby(request.getCollegeNearby());
        property.setImageUrls(request.getImageUrls());

        property.setUpdatedAt(LocalDateTime.now());

        // Validate available rooms <= total rooms
        if (property.getAvailableRooms() > property.getTotalRooms()) {
            throw new RuntimeException("Available rooms cannot exceed total rooms!");
        }

        Property savedProperty = propertyRepository.save(property);
        return PropertyResponse.fromProperty(savedProperty);
    }

    /**
     * Delete property
     */
    public void deleteProperty(String propertyId, String ownerId) {
        Optional<Property> propertyOpt = propertyRepository.findById(propertyId);
        if (propertyOpt.isEmpty()) {
            throw new RuntimeException("Property not found!");
        }

        Property property = propertyOpt.get();
        
        // Check if the owner is authorized to delete this property
        if (!property.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to delete this property!");
        }

        propertyRepository.delete(property);
    }

    /**
     * Get property statistics for owner
     */
    public PropertyStatistics getOwnerPropertyStatistics(String ownerId) {
        long totalProperties = propertyRepository.countByOwnerId(ownerId);
        long activeProperties = propertyRepository.countByOwnerIdAndStatus(ownerId, Property.PropertyStatus.ACTIVE);
        
        List<Property> ownerProperties = propertyRepository.findByOwnerId(ownerId);
        int totalRooms = ownerProperties.stream().mapToInt(Property::getTotalRooms).sum();
        int availableRooms = ownerProperties.stream().mapToInt(Property::getAvailableRooms).sum();
        
        return new PropertyStatistics(totalProperties, activeProperties, totalRooms, availableRooms);
    }

    /**
     * Search properties with filters (public method)
     */
    public List<Property> searchProperties(String city, String state, Property.PropertyType propertyType, 
                                         Property.RoomType roomType, Double minPrice, Double maxPrice, 
                                         Property.GenderPreference genderPreference) {
        
        List<Property> properties = propertyRepository.findByStatus(Property.PropertyStatus.ACTIVE);
        
        return properties.stream()
                .filter(property -> city == null || (property.getCity() != null && property.getCity().equalsIgnoreCase(city)))
                .filter(property -> state == null || (property.getState() != null && property.getState().equalsIgnoreCase(state)))
                .filter(property -> propertyType == null || property.getPropertyType() == propertyType)
                .filter(property -> roomType == null || property.getRoomType() == roomType)
                .filter(property -> genderPreference == null || property.getGenderPreference() == genderPreference)
                .filter(property -> minPrice == null || property.getMonthlyRent() >= minPrice)
                .filter(property -> maxPrice == null || property.getMonthlyRent() <= maxPrice)
                .collect(Collectors.toList());
    }

    // Inner class for statistics
    public static class PropertyStatistics {
        public final long totalProperties;
        public final long activeProperties;
        public final int totalRooms;
        public final int availableRooms;

        public PropertyStatistics(long totalProperties, long activeProperties, int totalRooms, int availableRooms) {
            this.totalProperties = totalProperties;
            this.activeProperties = activeProperties;
            this.totalRooms = totalRooms;
            this.availableRooms = availableRooms;
        }
    }
}
