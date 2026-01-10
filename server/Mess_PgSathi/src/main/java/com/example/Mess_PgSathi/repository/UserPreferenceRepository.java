package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.UserPreference;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserPreferenceRepository extends MongoRepository<UserPreference, String> {
    
    // Find by user
    Optional<UserPreference> findByUserId(String userId);
    boolean existsByUserId(String userId);
    
    // Delete by user
    void deleteByUserId(String userId);
}
