package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Favorite;
import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.repository.FavoriteRepository;
import com.example.Mess_PgSathi.repository.PropertyRepository;
import com.example.Mess_PgSathi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /**
     * Add property to favorites
     */
    public Favorite addToFavorites(String userId, String propertyId, String personalNote) {
        // Verify user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Verify property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found!"));

        // Check if already favorited
        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            throw new RuntimeException("Property already in favorites!");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setUserName(user.getFullName());
        favorite.setPropertyId(propertyId);
        favorite.setPropertyName(property.getName());
        favorite.setPropertyAddress(property.getAddress() + ", " + property.getCity());
        favorite.setPropertyCity(property.getCity());
        favorite.setMonthlyRent(property.getMonthlyRent());
        
        // Set first image if available
        if (property.getImageUrls() != null && !property.getImageUrls().isEmpty()) {
            favorite.setPropertyImageUrl(property.getImageUrls().get(0));
        }

        favorite.setOwnerId(property.getOwnerId());
        favorite.setOwnerName(property.getOwnerName());
        favorite.setPersonalNote(personalNote);
        favorite.setSavedAt(LocalDateTime.now());

        return favoriteRepository.save(favorite);
    }

    /**
     * Remove property from favorites
     */
    public void removeFromFavorites(String userId, String propertyId) {
        Optional<Favorite> favorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId);
        
        if (favorite.isEmpty()) {
            throw new RuntimeException("Property not in favorites!");
        }

        favoriteRepository.delete(favorite.get());
    }

    /**
     * Get all favorites for a user
     */
    public List<Favorite> getUserFavorites(String userId) {
        return favoriteRepository.findByUserIdOrderBySavedAtDesc(userId);
    }

    /**
     * Check if property is favorited by user
     */
    public boolean isFavorited(String userId, String propertyId) {
        return favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId);
    }

    /**
     * Update personal note for a favorite
     */
    public Favorite updateNote(String userId, String propertyId, String note) {
        Favorite favorite = favoriteRepository.findByUserIdAndPropertyId(userId, propertyId)
                .orElseThrow(() -> new RuntimeException("Property not in favorites!"));

        favorite.setPersonalNote(note);
        return favoriteRepository.save(favorite);
    }

    /**
     * Get favorite count for a property
     */
    public long getPropertyFavoriteCount(String propertyId) {
        return favoriteRepository.countByPropertyId(propertyId);
    }

    /**
     * Get total favorites count for a user
     */
    public long getUserFavoriteCount(String userId) {
        return favoriteRepository.countByUserId(userId);
    }

    /**
     * Toggle favorite status
     */
    public boolean toggleFavorite(String userId, String propertyId) {
        if (favoriteRepository.existsByUserIdAndPropertyId(userId, propertyId)) {
            removeFromFavorites(userId, propertyId);
            return false; // Removed
        } else {
            addToFavorites(userId, propertyId, null);
            return true; // Added
        }
    }
}
