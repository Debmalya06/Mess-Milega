package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Property;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepository extends MongoRepository<Property, String> {
    
    // Find properties by owner
    List<Property> findByOwnerId(String ownerId);
    
    // Find properties by status
    List<Property> findByStatus(Property.PropertyStatus status);
    
    // Find active properties by owner
    List<Property> findByOwnerIdAndStatus(String ownerId, Property.PropertyStatus status);
    
    // Find properties by city
    List<Property> findByCity(String city);
    
    // Find properties by city and status (for public search)
    List<Property> findByCityAndStatus(String city, Property.PropertyStatus status);
    
    // Find properties by gender preference
    List<Property> findByGenderPreferenceAndStatus(Property.GenderPreference genderPreference, Property.PropertyStatus status);
    
    // Find properties by property type
    List<Property> findByPropertyTypeAndStatus(Property.PropertyType propertyType, Property.PropertyStatus status);
    
    // Find properties by room type
    List<Property> findByRoomTypeAndStatus(Property.RoomType roomType, Property.PropertyStatus status);
    
    // Find properties by price range
    @Query("{ 'monthlyRent': { $gte: ?0, $lte: ?1 }, 'status': 'ACTIVE' }")
    List<Property> findByPriceRangeAndActiveStatus(Double minPrice, Double maxPrice);
    
    // Search properties by location (city contains)
    @Query("{ 'city': { $regex: ?0, $options: 'i' }, 'status': 'ACTIVE' }")
    List<Property> searchByLocationAndActiveStatus(String location);
    
    // Find properties with specific amenities
    @Query("{ $and: [ { 'status': 'ACTIVE' }, { $or: [ {'wifi': ?0}, {'parking': ?1}, {'meals': ?2}, {'laundry': ?3} ] } ] }")
    List<Property> findByAmenitiesAndActiveStatus(boolean wifi, boolean parking, boolean meals, boolean laundry);
    
    // Count properties by owner
    long countByOwnerId(String ownerId);
    
    // Count active properties by owner
    long countByOwnerIdAndStatus(String ownerId, Property.PropertyStatus status);
}
