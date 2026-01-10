package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.UserPreference;
import com.example.Mess_PgSathi.repository.UserPreferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserPreferenceService {

    private final UserPreferenceRepository userPreferenceRepository;

    /**
     * Create or update user preferences
     */
    public UserPreference savePreferences(String userId, String userEmail, UserPreference preferences) {
        UserPreference existingPreference = userPreferenceRepository.findByUserId(userId).orElse(null);

        if (existingPreference != null) {
            // Update existing preferences
            updatePreferences(existingPreference, preferences);
            existingPreference.setUpdatedAt(LocalDateTime.now());
            return userPreferenceRepository.save(existingPreference);
        } else {
            // Create new preferences
            preferences.setUserId(userId);
            preferences.setUserEmail(userEmail);
            preferences.setCreatedAt(LocalDateTime.now());
            preferences.setUpdatedAt(LocalDateTime.now());
            return userPreferenceRepository.save(preferences);
        }
    }

    /**
     * Get user preferences
     */
    public UserPreference getPreferences(String userId) {
        return userPreferenceRepository.findByUserId(userId)
                .orElse(createDefaultPreferences(userId));
    }

    /**
     * Update location preferences
     */
    public UserPreference updateLocationPreferences(String userId, List<String> preferredCities, 
                                                    List<String> preferredAreas, String preferredState,
                                                    Double maxDistanceFromCollege, String collegeOrWorkplace,
                                                    String collegeOrWorkplaceAddress) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setPreferredCities(preferredCities != null ? preferredCities : new ArrayList<>());
        preferences.setPreferredAreas(preferredAreas != null ? preferredAreas : new ArrayList<>());
        preferences.setPreferredState(preferredState);
        preferences.setMaxDistanceFromCollege(maxDistanceFromCollege);
        preferences.setCollegeOrWorkplace(collegeOrWorkplace);
        preferences.setCollegeOrWorkplaceAddress(collegeOrWorkplaceAddress);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Update budget preferences
     */
    public UserPreference updateBudgetPreferences(String userId, Double minBudget, Double maxBudget,
                                                  boolean includeSecurityDeposit) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setMinBudget(minBudget);
        preferences.setMaxBudget(maxBudget);
        preferences.setIncludeSecurityDeposit(includeSecurityDeposit);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Update property preferences
     */
    public UserPreference updatePropertyPreferences(String userId, Property.PropertyType preferredPropertyType,
                                                    Property.RoomType preferredRoomType,
                                                    Property.GenderPreference genderPreference) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setPreferredPropertyType(preferredPropertyType);
        preferences.setPreferredRoomType(preferredRoomType);
        preferences.setGenderPreference(genderPreference);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Update amenity preferences
     */
    public UserPreference updateAmenityPreferences(String userId, boolean needWifi, boolean needParking,
                                                   boolean needMeals, boolean needLaundry, boolean needAc,
                                                   boolean needTv, boolean needGym, boolean needSecurity,
                                                   boolean needPowerBackup, boolean needHousekeeping) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setNeedWifi(needWifi);
        preferences.setNeedParking(needParking);
        preferences.setNeedMeals(needMeals);
        preferences.setNeedLaundry(needLaundry);
        preferences.setNeedAc(needAc);
        preferences.setNeedTv(needTv);
        preferences.setNeedGym(needGym);
        preferences.setNeedSecurity(needSecurity);
        preferences.setNeedPowerBackup(needPowerBackup);
        preferences.setNeedHousekeeping(needHousekeeping);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Update lifestyle preferences
     */
    public UserPreference updateLifestylePreferences(String userId, boolean vegetarianOnly, 
                                                     boolean nonSmoker, boolean noPets,
                                                     boolean quietEnvironment, String workSchedule) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setVegetarianOnly(vegetarianOnly);
        preferences.setNonSmoker(nonSmoker);
        preferences.setNoPets(noPets);
        preferences.setQuietEnvironment(quietEnvironment);
        preferences.setWorkSchedule(workSchedule);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Update notification preferences
     */
    public UserPreference updateNotificationPreferences(String userId, boolean emailNotifications,
                                                        boolean smsNotifications, boolean pushNotifications,
                                                        boolean notifyNewListings, boolean notifyPriceDrops) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        preferences.setEmailNotifications(emailNotifications);
        preferences.setSmsNotifications(smsNotifications);
        preferences.setPushNotifications(pushNotifications);
        preferences.setNotifyNewListings(notifyNewListings);
        preferences.setNotifyPriceDrops(notifyPriceDrops);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Add search to history
     */
    public UserPreference addSearchHistory(String userId, String searchQuery, String city,
                                          Double minPrice, Double maxPrice) {
        UserPreference preferences = getOrCreatePreferences(userId);
        
        UserPreference.SearchHistory search = new UserPreference.SearchHistory();
        search.setSearchQuery(searchQuery);
        search.setCity(city);
        search.setMinPrice(minPrice);
        search.setMaxPrice(maxPrice);
        search.setSearchedAt(LocalDateTime.now());

        // Keep only last 10 searches
        List<UserPreference.SearchHistory> searches = preferences.getRecentSearches();
        if (searches.size() >= 10) {
            searches.remove(0); // Remove oldest
        }
        searches.add(search);
        
        preferences.setRecentSearches(searches);
        preferences.setUpdatedAt(LocalDateTime.now());

        return userPreferenceRepository.save(preferences);
    }

    /**
     * Clear search history
     */
    public UserPreference clearSearchHistory(String userId) {
        UserPreference preferences = getOrCreatePreferences(userId);
        preferences.setRecentSearches(new ArrayList<>());
        preferences.setUpdatedAt(LocalDateTime.now());
        return userPreferenceRepository.save(preferences);
    }

    /**
     * Delete user preferences
     */
    public void deletePreferences(String userId) {
        userPreferenceRepository.deleteByUserId(userId);
    }

    // Helper methods
    private UserPreference getOrCreatePreferences(String userId) {
        return userPreferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userId));
    }

    private UserPreference createDefaultPreferences(String userId) {
        UserPreference preferences = new UserPreference();
        preferences.setUserId(userId);
        preferences.setPreferredCities(new ArrayList<>());
        preferences.setPreferredAreas(new ArrayList<>());
        preferences.setRecentSearches(new ArrayList<>());
        preferences.setCreatedAt(LocalDateTime.now());
        preferences.setUpdatedAt(LocalDateTime.now());
        return preferences;
    }

    private void updatePreferences(UserPreference existing, UserPreference updated) {
        if (updated.getPreferredCities() != null) existing.setPreferredCities(updated.getPreferredCities());
        if (updated.getPreferredAreas() != null) existing.setPreferredAreas(updated.getPreferredAreas());
        if (updated.getPreferredState() != null) existing.setPreferredState(updated.getPreferredState());
        if (updated.getMaxDistanceFromCollege() != null) existing.setMaxDistanceFromCollege(updated.getMaxDistanceFromCollege());
        if (updated.getCollegeOrWorkplace() != null) existing.setCollegeOrWorkplace(updated.getCollegeOrWorkplace());
        if (updated.getMinBudget() != null) existing.setMinBudget(updated.getMinBudget());
        if (updated.getMaxBudget() != null) existing.setMaxBudget(updated.getMaxBudget());
        if (updated.getPreferredPropertyType() != null) existing.setPreferredPropertyType(updated.getPreferredPropertyType());
        if (updated.getPreferredRoomType() != null) existing.setPreferredRoomType(updated.getPreferredRoomType());
        if (updated.getGenderPreference() != null) existing.setGenderPreference(updated.getGenderPreference());
        if (updated.getExpectedMoveInDate() != null) existing.setExpectedMoveInDate(updated.getExpectedMoveInDate());
        existing.setExpectedStayMonths(updated.getExpectedStayMonths());
        // Update boolean fields
        existing.setNeedWifi(updated.isNeedWifi());
        existing.setNeedParking(updated.isNeedParking());
        existing.setNeedMeals(updated.isNeedMeals());
        existing.setNeedLaundry(updated.isNeedLaundry());
        existing.setNeedAc(updated.isNeedAc());
        existing.setNeedTv(updated.isNeedTv());
        existing.setNeedGym(updated.isNeedGym());
        existing.setNeedSecurity(updated.isNeedSecurity());
        existing.setNeedPowerBackup(updated.isNeedPowerBackup());
        existing.setNeedHousekeeping(updated.isNeedHousekeeping());
        existing.setVegetarianOnly(updated.isVegetarianOnly());
        existing.setNonSmoker(updated.isNonSmoker());
        existing.setNoPets(updated.isNoPets());
        existing.setQuietEnvironment(updated.isQuietEnvironment());
        existing.setEmailNotifications(updated.isEmailNotifications());
        existing.setSmsNotifications(updated.isSmsNotifications());
        existing.setPushNotifications(updated.isPushNotifications());
        existing.setNotifyNewListings(updated.isNotifyNewListings());
        existing.setNotifyPriceDrops(updated.isNotifyPriceDrops());
    }
}
