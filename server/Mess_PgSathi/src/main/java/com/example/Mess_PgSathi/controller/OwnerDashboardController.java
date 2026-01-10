package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.*;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import com.example.Mess_PgSathi.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PG_OWNER')")
public class OwnerDashboardController {

    private final PropertyService propertyService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final InquiryService inquiryService;
    private final VisitScheduleService visitScheduleService;
    private final ReviewService reviewService;

    // ===================== DASHBOARD =====================

    /**
     * Get owner dashboard summary
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Map<String, Object> dashboard = new HashMap<>();
            
            // Property statistics
            PropertyService.PropertyStatistics propertyStats = 
                    propertyService.getOwnerPropertyStatistics(userDetails.getId());
            dashboard.put("propertyStats", propertyStats);
            
            // Booking statistics
            BookingService.BookingStatistics bookingStats = 
                    bookingService.getOwnerBookingStatistics(userDetails.getId());
            dashboard.put("bookingStats", bookingStats);
            
            // Payment statistics
            PaymentService.PaymentStatistics paymentStats = 
                    paymentService.getOwnerPaymentStatistics(userDetails.getId());
            dashboard.put("paymentStats", paymentStats);
            
            // Pending booking requests
            List<Booking> pendingBookings = bookingService.getOwnerBookingsByStatus(
                    userDetails.getId(), 
                    Booking.BookingStatus.PENDING
            );
            dashboard.put("pendingBookings", pendingBookings.size());
            dashboard.put("pendingBookingsList", pendingBookings.stream().limit(5).toList());
            
            // Pending inquiries
            List<Inquiry> pendingInquiries = inquiryService.getPendingInquiries(userDetails.getId());
            dashboard.put("pendingInquiries", pendingInquiries.size());
            
            // Today's visits
            List<VisitSchedule> todaysVisits = visitScheduleService.getOwnerVisitsByDate(
                    userDetails.getId(), 
                    LocalDate.now()
            );
            dashboard.put("todaysVisits", todaysVisits);
            
            // Pending visit requests
            List<VisitSchedule> pendingVisits = visitScheduleService.getPendingVisitRequests(userDetails.getId());
            dashboard.put("pendingVisitRequests", pendingVisits.size());
            
            // Recent reviews
            List<Review> reviews = reviewService.getOwnerPropertyReviews(userDetails.getId());
            dashboard.put("totalReviews", reviews.size());
            dashboard.put("recentReviews", reviews.stream().limit(5).toList());
            
            // Calculate average rating
            if (!reviews.isEmpty()) {
                double avgRating = reviews.stream()
                        .mapToInt(Review::getOverallRating)
                        .average()
                        .orElse(0);
                dashboard.put("averageRating", Math.round(avgRating * 10.0) / 10.0);
            } else {
                dashboard.put("averageRating", 0);
            }
            
            return ResponseEntity.ok(dashboard);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== INQUIRIES =====================

    /**
     * Get all inquiries
     */
    @GetMapping("/inquiries")
    public ResponseEntity<?> getInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Inquiry> inquiries = inquiryService.getOwnerInquiries(userDetails.getId());
            return ResponseEntity.ok(inquiries);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get pending inquiries
     */
    @GetMapping("/inquiries/pending")
    public ResponseEntity<?> getPendingInquiries(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Inquiry> inquiries = inquiryService.getPendingInquiries(userDetails.getId());
            return ResponseEntity.ok(inquiries);
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

    // ===================== VISITS =====================

    /**
     * Get all visit requests
     */
    @GetMapping("/visits")
    public ResponseEntity<?> getVisits(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<VisitSchedule> visits = visitScheduleService.getOwnerVisits(userDetails.getId());
            return ResponseEntity.ok(visits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get pending visit requests
     */
    @GetMapping("/visits/pending")
    public ResponseEntity<?> getPendingVisits(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<VisitSchedule> visits = visitScheduleService.getPendingVisitRequests(userDetails.getId());
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
            List<VisitSchedule> visits = visitScheduleService.getUpcomingOwnerVisits(userDetails.getId());
            return ResponseEntity.ok(visits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get today's visits
     */
    @GetMapping("/visits/today")
    public ResponseEntity<?> getTodaysVisits(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<VisitSchedule> visits = visitScheduleService.getOwnerVisitsByDate(
                    userDetails.getId(), 
                    LocalDate.now()
            );
            return ResponseEntity.ok(visits);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Confirm visit
     */
    @PostMapping("/visits/{visitId}/confirm")
    public ResponseEntity<?> confirmVisit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String visitId,
            @RequestParam(required = false) String note) {
        try {
            VisitSchedule visit = visitScheduleService.confirmVisit(visitId, userDetails.getId(), note);
            return ResponseEntity.ok(visit);
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
            @RequestParam String newDate,
            @RequestParam String newTime,
            @RequestParam String reason) {
        try {
            LocalDate date = LocalDate.parse(newDate);
            LocalTime time = LocalTime.parse(newTime);
            VisitSchedule visit = visitScheduleService.rescheduleVisit(
                    visitId, 
                    userDetails.getId(), 
                    date, 
                    time, 
                    reason
            );
            return ResponseEntity.ok(visit);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Complete visit
     */
    @PostMapping("/visits/{visitId}/complete")
    public ResponseEntity<?> completeVisit(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String visitId,
            @RequestParam(required = false) String feedback) {
        try {
            VisitSchedule visit = visitScheduleService.completeVisit(visitId, userDetails.getId(), feedback);
            return ResponseEntity.ok(visit);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Mark as no-show
     */
    @PostMapping("/visits/{visitId}/no-show")
    public ResponseEntity<?> markNoShow(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String visitId) {
        try {
            VisitSchedule visit = visitScheduleService.markNoShow(visitId, userDetails.getId());
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
     * Get reviews for my properties
     */
    @GetMapping("/reviews")
    public ResponseEntity<?> getReviews(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Review> reviews = reviewService.getOwnerPropertyReviews(userDetails.getId());
            return ResponseEntity.ok(reviews);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Respond to review
     */
    @PostMapping("/reviews/{reviewId}/respond")
    public ResponseEntity<?> respondToReview(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String reviewId,
            @RequestParam String response) {
        try {
            Review review = reviewService.respondToReview(reviewId, userDetails.getId(), response);
            return ResponseEntity.ok(review);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get property rating summary
     */
    @GetMapping("/properties/{propertyId}/ratings")
    public ResponseEntity<?> getPropertyRatings(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String propertyId) {
        try {
            ReviewService.PropertyRatingSummary summary = reviewService.getPropertyRatingSummary(propertyId);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== ACTIVE TENANTS =====================

    /**
     * Get active bookings (current tenants)
     */
    @GetMapping("/tenants/active")
    public ResponseEntity<?> getActiveTenants(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> activeBookings = bookingService.getOwnerBookingsByStatus(
                    userDetails.getId(), 
                    Booking.BookingStatus.ACTIVE
            );
            return ResponseEntity.ok(activeBookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get bookings awaiting document verification
     */
    @GetMapping("/tenants/pending-verification")
    public ResponseEntity<?> getPendingVerification(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> bookings = bookingService.getOwnerBookingsByStatus(
                    userDetails.getId(), 
                    Booking.BookingStatus.DOCS_SUBMITTED
            );
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get bookings awaiting payment
     */
    @GetMapping("/tenants/pending-payment")
    public ResponseEntity<?> getPendingPayment(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> bookings = bookingService.getOwnerBookingsByStatus(
                    userDetails.getId(), 
                    Booking.BookingStatus.PAYMENT_PENDING
            );
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
