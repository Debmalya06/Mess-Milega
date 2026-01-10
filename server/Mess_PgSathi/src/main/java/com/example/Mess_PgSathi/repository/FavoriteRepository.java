package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Favorite;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    
    // Find by user
    List<Favorite> findByUserId(String userId);
    List<Favorite> findByUserIdOrderBySavedAtDesc(String userId);
    
    // Find by property
    List<Favorite> findByPropertyId(String propertyId);
    
    // Check if already favorited
    Optional<Favorite> findByUserIdAndPropertyId(String userId, String propertyId);
    boolean existsByUserIdAndPropertyId(String userId, String propertyId);
    
    // Delete favorite
    void deleteByUserIdAndPropertyId(String userId, String propertyId);
    
    // Count methods
    long countByUserId(String userId);
    long countByPropertyId(String propertyId);
}
