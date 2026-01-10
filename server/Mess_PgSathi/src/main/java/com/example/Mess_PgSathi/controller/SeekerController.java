package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.*;
import com.example.Mess_PgSathi.payload.request.*;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import com.example.Mess_PgSathi.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seeker")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROOM_FINDER')")
public class SeekerController {

    private final FavoriteService favoriteService;
    private final InquiryService inquiryService;
    private final VisitScheduleService visitScheduleService;
    private final ReviewService reviewService;
    private final UserPreferenceService userPreferenceService;

    // ===================== FAVORITES =====================

    /**
     * Add property to favorites
     */
    @PostMapping("/favorites/{propertyId}")
    public ResponseEntity<?> addToFavorites(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId,
            @RequestParam(required = false) String note) {
        try {
            Favorite favorite = favoriteService.addToFavorites(userDetails.getId(), propertyId, note);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Remove property from favorites
     */
    @DeleteMapping("/favorites/{propertyId}")
    public ResponseEntity<?> removeFromFavorites(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId) {
        try {
            favoriteService.removeFromFavorites(userDetails.getId(), propertyId);
            return ResponseEntity.ok(new MessageResponse("Property removed from favorites!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Toggle favorite
     */
    @PostMapping("/favorites/{propertyId}/toggle")
    public ResponseEntity<?> toggleFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId) {
        try {
            boolean isFavorited = favoriteService.toggleFavorite(userDetails.getId(), propertyId);
            Map<String, Object> response = new HashMap<>();
            response.put("isFavorited", isFavorited);
            response.put("message", isFavorited ? "Added to favorites!" : "Removed from favorites!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get all favorites
     */
    @GetMapping("/favorites")
    public ResponseEntity<?> getMyFavorites(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Favorite> favorites = favoriteService.getUserFavorites(userDetails.getId());
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Check if property is favorited
     */
    @GetMapping("/favorites/{propertyId}/check")
    public ResponseEntity<?> checkFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId) {
        try {
            boolean isFavorited = favoriteService.isFavorited(userDetails.getId(), propertyId);
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFavorited", isFavorited);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update favorite note
     */
    @PutMapping("/favorites/{propertyId}/note")
    public ResponseEntity<?> updateFavoriteNote(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId,
            @RequestParam String note) {
        try {
            Favorite favorite = favoriteService.updateNote(userDetails.getId(), propertyId, note);
            return ResponseEntity.ok(favorite);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== INQUIRIES =====================

    /**
     * Send inquiry to owner
     */
    @PostMapping("/inquiries")
    public ResponseEntity<?> sendInquiry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody InquiryRequest request) {
        try {
            Inquiry.InquiryType type = request.getInquiryType() != null 
                    ? Inquiry.InquiryType.valueOf(request.getInquiryType().toUpperCase())
                    : Inquiry.InquiryType.GENERAL;
            
            Inquiry inquiry = inquiryService.sendInquiry(
                    userDetails.getId(),
                    request.getPropertyId(),
                    request.getSubject(),
                    request.getMessage(),
                    type
            );
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reply to inquiry
     */
    @PostMapping("/inquiries/{inquiryId}/reply")
    public ResponseEntity<?> replyToInquiry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String inquiryId,
            @RequestParam String message) {
        try {
            Inquiry inquiry = inquiryService.replyToInquiry(inquiryId, userDetails.getId(), message);
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get my inquiries
     */
    @GetMapping("/inquiries")
    public ResponseEntity<?> getMyInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Inquiry> inquiries = inquiryService.getSeekerInquiries(userDetails.getId());
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get inquiry by ID
     */
    @GetMapping("/inquiries/{inquiryId}")
    public ResponseEntity<?> getInquiryById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String inquiryId) {
        try {
            Inquiry inquiry = inquiryService.getInquiryById(inquiryId);
            if (!inquiry.getSeekerId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).body(new MessageResponse("Access denied!"));
            }
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Mark inquiry as read
     */
    @PostMapping("/inquiries/{inquiryId}/read")
    public ResponseEntity<?> markInquiryAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String inquiryId) {
        try {
            Inquiry inquiry = inquiryService.markAsRead(inquiryId, userDetails.getId());
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Close inquiry
     */
    @PostMapping("/inquiries/{inquiryId}/close")
    public ResponseEntity<?> closeInquiry(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String inquiryId) {
        try {
            Inquiry inquiry = inquiryService.closeInquiry(inquiryId, userDetails.getId());
            return ResponseEntity.ok(inquiry);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== VISIT SCHEDULES =====================

    /**
     * Schedule a visit
     */
    @PostMapping("/visits")
    public ResponseEntity<?> scheduleVisit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody VisitScheduleRequest request) {
        try {
            VisitSchedule visit = visitScheduleService.scheduleVisit(
                    userDetails.getId(),
                    request.getPropertyId(),
                    request.getVisitDate(),
                    request.getVisitTime(),
                    request.getVisitPurpose(),
                    request.getSeekerNote()
            );
            return ResponseEntity.ok(visit);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get my visits
     */
    @GetMapping("/visits")
    public ResponseEntity<?> getMyVisits(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<VisitSchedule> visits = visitScheduleService.getSeekerVisits(userDetails.getId());
            return ResponseEntity.ok(visits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get upcoming visits
     */
    @GetMapping("/visits/upcoming")
    public ResponseEntity<?> getUpcomingVisits(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<VisitSchedule> visits = visitScheduleService.getUpcomingSeekerVisits(userDetails.getId());
            return ResponseEntity.ok(visits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reschedule visit
     */
    @PutMapping("/visits/{visitId}/reschedule")
    public ResponseEntity<?> rescheduleVisit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String visitId,
            @Valid @RequestBody VisitScheduleRequest request) {
        try {
            VisitSchedule visit = visitScheduleService.rescheduleVisit(
                    visitId,
                    userDetails.getId(),
                    request.getVisitDate(),
                    request.getVisitTime(),
                    request.getSeekerNote()
            );
            return ResponseEntity.ok(visit);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Cancel visit
     */
    @PostMapping("/visits/{visitId}/cancel")
    public ResponseEntity<?> cancelVisit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String visitId,
            @RequestParam String reason) {
        try {
            VisitSchedule visit = visitScheduleService.cancelVisit(visitId, userDetails.getId(), reason);
            return ResponseEntity.ok(visit);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== REVIEWS =====================

    /**
     * Write a review
     */
    @PostMapping("/reviews")
    public ResponseEntity<?> writeReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ReviewRequest request) {
        try {
            Review review = reviewService.writeReview(
                    userDetails.getId(),
                    request.getPropertyId(),
                    request.getBookingId(),
                    request.getOverallRating(),
                    request.getCleanlinessRating(),
                    request.getLocationRating(),
                    request.getAmenitiesRating(),
                    request.getValueForMoneyRating(),
                    request.getOwnerBehaviorRating(),
                    request.getTitle(),
                    request.getReviewText(),
                    request.getPros(),
                    request.getCons(),
                    request.getImages(),
                    request.isWouldRecommend(),
                    request.getStayDurationMonths(),
                    request.getStayPeriod()
            );
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get my reviews
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getMyReviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Review> reviews = reviewService.getReviewerReviews(userDetails.getId());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Mark review as helpful
     */
    @PostMapping("/reviews/{reviewId}/helpful")
    public ResponseEntity<?> markReviewHelpful(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String reviewId) {
        try {
            Review review = reviewService.markHelpful(reviewId, userDetails.getId());
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Report a review
     */
    @PostMapping("/reviews/{reviewId}/report")
    public ResponseEntity<?> reportReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String reviewId,
            @RequestParam String reason) {
        try {
            Review review = reviewService.reportReview(reviewId, userDetails.getId(), reason);
            return ResponseEntity.ok(new MessageResponse("Review reported successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== PREFERENCES =====================

    /**
     * Get my preferences
     */
    @GetMapping("/preferences")
    public ResponseEntity<?> getMyPreferences(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            UserPreference preferences = userPreferenceService.getPreferences(userDetails.getId());
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update all preferences
     */
    @PutMapping("/preferences")
    public ResponseEntity<?> updatePreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserPreferenceRequest request) {
        try {
            UserPreference preferences = convertToUserPreference(request);
            UserPreference saved = userPreferenceService.savePreferences(
                    userDetails.getId(),
                    userDetails.getEmail(),
                    preferences
            );
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update location preferences
     */
    @PutMapping("/preferences/location")
    public ResponseEntity<?> updateLocationPreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserPreferenceRequest request) {
        try {
            UserPreference preferences = userPreferenceService.updateLocationPreferences(
                    userDetails.getId(),
                    request.getPreferredCities(),
                    request.getPreferredAreas(),
                    request.getPreferredState(),
                    request.getMaxDistanceFromCollege(),
                    request.getCollegeOrWorkplace(),
                    request.getCollegeOrWorkplaceAddress()
            );
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Update budget preferences
     */
    @PutMapping("/preferences/budget")
    public ResponseEntity<?> updateBudgetPreferences(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody UserPreferenceRequest request) {
        try {
            UserPreference preferences = userPreferenceService.updateBudgetPreferences(
                    userDetails.getId(),
                    request.getMinBudget(),
                    request.getMaxBudget(),
                    request.isIncludeSecurityDeposit()
            );
            return ResponseEntity.ok(preferences);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Clear search history
     */
    @DeleteMapping("/preferences/search-history")
    public ResponseEntity<?> clearSearchHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            userPreferenceService.clearSearchHistory(userDetails.getId());
            return ResponseEntity.ok(new MessageResponse("Search history cleared!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== DASHBOARD =====================

    /**
     * Get seeker dashboard data
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Favorites count
            dashboard.put("favoritesCount", favoriteService.getUserFavoriteCount(userDetails.getId()));
            
            // Recent favorites (last 5)
            List<Favorite> favorites = favoriteService.getUserFavorites(userDetails.getId());
            dashboard.put("recentFavorites", favorites.stream().limit(5).toList());
            
            // Upcoming visits
            List<VisitSchedule> upcomingVisits = visitScheduleService.getUpcomingSeekerVisits(userDetails.getId());
            dashboard.put("upcomingVisits", upcomingVisits);
            
            // Unread inquiry count
            dashboard.put("unreadInquiries", inquiryService.getUnreadCount(userDetails.getId()));
            
            // Recent inquiries
            List<Inquiry> inquiries = inquiryService.getSeekerInquiries(userDetails.getId());
            dashboard.put("recentInquiries", inquiries.stream().limit(5).toList());
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // Helper method
    private UserPreference convertToUserPreference(UserPreferenceRequest request) {
        UserPreference pref = new UserPreference();
        pref.setPreferredCities(request.getPreferredCities());
        pref.setPreferredAreas(request.getPreferredAreas());
        pref.setPreferredState(request.getPreferredState());
        pref.setMaxDistanceFromCollege(request.getMaxDistanceFromCollege());
        pref.setCollegeOrWorkplace(request.getCollegeOrWorkplace());
        pref.setCollegeOrWorkplaceAddress(request.getCollegeOrWorkplaceAddress());
        pref.setMinBudget(request.getMinBudget());
        pref.setMaxBudget(request.getMaxBudget());
        pref.setIncludeSecurityDeposit(request.isIncludeSecurityDeposit());
        
        if (request.getPreferredPropertyType() != null) {
            pref.setPreferredPropertyType(Property.PropertyType.valueOf(request.getPreferredPropertyType().toUpperCase()));
        }
        if (request.getPreferredRoomType() != null) {
            pref.setPreferredRoomType(Property.RoomType.valueOf(request.getPreferredRoomType().toUpperCase()));
        }
        if (request.getGenderPreference() != null) {
            pref.setGenderPreference(Property.GenderPreference.valueOf(request.getGenderPreference().toUpperCase()));
        }
        
        pref.setNeedWifi(request.isNeedWifi());
        pref.setNeedParking(request.isNeedParking());
        pref.setNeedMeals(request.isNeedMeals());
        pref.setNeedLaundry(request.isNeedLaundry());
        pref.setNeedAc(request.isNeedAc());
        pref.setNeedTv(request.isNeedTv());
        pref.setNeedGym(request.isNeedGym());
        pref.setNeedSecurity(request.isNeedSecurity());
        pref.setNeedPowerBackup(request.isNeedPowerBackup());
        pref.setNeedHousekeeping(request.isNeedHousekeeping());
        
        pref.setExpectedMoveInDate(request.getExpectedMoveInDate());
        pref.setExpectedStayMonths(request.getExpectedStayMonths());
        
        pref.setVegetarianOnly(request.isVegetarianOnly());
        pref.setNonSmoker(request.isNonSmoker());
        pref.setNoPets(request.isNoPets());
        pref.setQuietEnvironment(request.isQuietEnvironment());
        pref.setWorkSchedule(request.getWorkSchedule());
        
        pref.setEmailNotifications(request.isEmailNotifications());
        pref.setSmsNotifications(request.isSmsNotifications());
        pref.setPushNotifications(request.isPushNotifications());
        pref.setNotifyNewListings(request.isNotifyNewListings());
        pref.setNotifyPriceDrops(request.isNotifyPriceDrops());
        
        return pref;
    }
}
