package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.Booking;
import com.example.Mess_PgSathi.payload.request.BookingRequest;
import com.example.Mess_PgSathi.payload.request.DocumentSubmitRequest;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import com.example.Mess_PgSathi.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // ===================== SEEKER ENDPOINTS =====================

    /**
     * Create a new booking request (Seeker)
     */
    @PostMapping("/request")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> createBookingRequest(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BookingRequest request) {
        try {
            Booking booking = bookingService.createBookingRequest(
                    userDetails.getId(),
                    request.getPropertyId(),
                    request.getCheckInDate(),
                    request.getNumberOfMonths()
            );
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Submit documents for booking (Seeker)
     */
    @PostMapping("/{bookingId}/documents")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> submitDocuments(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestBody DocumentSubmitRequest request) {
        try {
            List<Booking.DocumentInfo> documents = request.getDocuments().stream()
                    .map(doc -> {
                        Booking.DocumentInfo docInfo = new Booking.DocumentInfo();
                        docInfo.setDocumentType(doc.getDocumentType());
                        docInfo.setDocumentUrl(doc.getDocumentUrl());
                        docInfo.setDocumentNumber(doc.getDocumentNumber());
                        docInfo.setUploadedAt(LocalDateTime.now());
                        return docInfo;
                    })
                    .collect(Collectors.toList());

            Booking booking = bookingService.submitDocuments(bookingId, userDetails.getId(), documents);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get seeker's bookings (Seeker)
     */
    @GetMapping("/my-bookings")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> bookings = bookingService.getSeekerBookings(userDetails.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get seeker's active booking (Seeker)
     */
    @GetMapping("/my-bookings/active")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> getMyActiveBooking(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            return bookingService.getActiveSeekerBooking(userDetails.getId())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Cancel booking (Seeker)
     */
    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("hasRole('ROOM_FINDER') or hasRole('PG_OWNER')")
    public ResponseEntity<?> cancelBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestParam String reason) {
        try {
            Booking booking = bookingService.cancelBooking(bookingId, userDetails.getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== OWNER ENDPOINTS =====================

    /**
     * Get owner's booking requests (Owner)
     */
    @GetMapping("/owner/requests")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getOwnerBookingRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> bookings = bookingService.getOwnerBookings(userDetails.getId());
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get pending booking requests (Owner)
     */
    @GetMapping("/owner/requests/pending")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getPendingBookingRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Booking> bookings = bookingService.getOwnerBookingsByStatus(
                    userDetails.getId(), 
                    Booking.BookingStatus.PENDING
            );
            return ResponseEntity.ok(bookings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Confirm booking request (Owner)
     */
    @PostMapping("/{bookingId}/confirm")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> confirmBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId) {
        try {
            Booking booking = bookingService.confirmBooking(bookingId, userDetails.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Reject booking request (Owner)
     */
    @PostMapping("/{bookingId}/reject")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> rejectBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestParam String reason) {
        try {
            Booking booking = bookingService.rejectBooking(bookingId, userDetails.getId(), reason);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Verify documents (Owner)
     */
    @PostMapping("/{bookingId}/verify-documents")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> verifyDocuments(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestParam boolean approved,
            @RequestParam(required = false) String note) {
        try {
            Booking booking = bookingService.verifyDocuments(bookingId, userDetails.getId(), approved, note);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Request payment after document verification (Owner)
     */
    @PostMapping("/{bookingId}/request-payment")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> requestPayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId) {
        try {
            Booking booking = bookingService.requestPayment(bookingId, userDetails.getId());
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Confirm advance payment received (Owner)
     */
    @PostMapping("/{bookingId}/confirm-payment")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> confirmAdvancePayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestParam String paymentMethod) {
        try {
            Booking booking = bookingService.confirmAdvancePayment(
                    bookingId, 
                    userDetails.getId(), 
                    paymentMethod
            );
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Complete booking (Owner - when seeker moves out)
     */
    @PostMapping("/{bookingId}/complete")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> completeBooking(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId,
            @RequestParam String checkOutDate) {
        try {
            LocalDate date = LocalDate.parse(checkOutDate);
            Booking booking = bookingService.completeBooking(bookingId, userDetails.getId(), date);
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get booking statistics (Owner)
     */
    @GetMapping("/owner/statistics")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getOwnerBookingStatistics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            BookingService.BookingStatistics stats = bookingService.getOwnerBookingStatistics(userDetails.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== COMMON ENDPOINTS =====================

    /**
     * Get booking by ID
     */
    @GetMapping("/{bookingId}")
    @PreAuthorize("hasRole('ROOM_FINDER') or hasRole('PG_OWNER')")
    public ResponseEntity<?> getBookingById(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId) {
        try {
            Booking booking = bookingService.getBookingById(bookingId);
            
            // Verify user is part of this booking
            if (!booking.getSeekerId().equals(userDetails.getId()) && 
                !booking.getOwnerId().equals(userDetails.getId())) {
                return ResponseEntity.status(403).body(new MessageResponse("Access denied!"));
            }
            
            return ResponseEntity.ok(booking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
