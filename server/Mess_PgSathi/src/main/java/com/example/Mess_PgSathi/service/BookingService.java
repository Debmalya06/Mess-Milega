package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.*;
import com.example.Mess_PgSathi.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Create a new booking request (Seeker action)
     */
    public Booking createBookingRequest(String seekerId, String propertyId, LocalDate checkInDate, int numberOfMonths) {
        // Verify seeker exists
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("Seeker not found!"));
        
        if (!seeker.getRole().equals(User.Role.ROOM_FINDER)) {
            throw new RuntimeException("Only room finders can book properties!");
        }

        // Verify property exists and is active
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found!"));
        
        if (property.getStatus() != Property.PropertyStatus.ACTIVE) {
            throw new RuntimeException("This property is not available for booking!");
        }

        if (property.getAvailableRooms() <= 0) {
            throw new RuntimeException("No rooms available in this property!");
        }

        // Check if seeker already has an active booking for this property
        List<Booking.BookingStatus> activeStatuses = Arrays.asList(
                Booking.BookingStatus.PENDING,
                Booking.BookingStatus.OWNER_CONFIRMED,
                Booking.BookingStatus.DOCS_SUBMITTED,
                Booking.BookingStatus.DOCS_VERIFIED,
                Booking.BookingStatus.PAYMENT_PENDING,
                Booking.BookingStatus.ACTIVE
        );
        
        if (bookingRepository.existsBySeekerIdAndPropertyIdAndStatusIn(seekerId, propertyId, activeStatuses)) {
            throw new RuntimeException("You already have an active booking for this property!");
        }

        // Get owner information
        User owner = userRepository.findById(property.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Property owner not found!"));

        // Create booking
        Booking booking = new Booking();
        booking.setPropertyId(propertyId);
        booking.setPropertyName(property.getName());
        booking.setPropertyAddress(property.getAddress() + ", " + property.getCity());
        booking.setRoomType(property.getRoomType().name());

        booking.setSeekerId(seekerId);
        booking.setSeekerName(seeker.getFullName());
        booking.setSeekerEmail(seeker.getEmail());
        booking.setSeekerPhone(seeker.getPhoneNumber());

        booking.setOwnerId(property.getOwnerId());
        booking.setOwnerName(owner.getFullName());
        booking.setOwnerEmail(owner.getEmail());
        booking.setOwnerPhone(owner.getPhoneNumber());

        booking.setCheckInDate(checkInDate);
        booking.setNumberOfMonths(numberOfMonths);
        booking.setMonthlyRent(property.getMonthlyRent());
        booking.setSecurityDeposit(property.getSecurityDeposit());
        booking.setAdvancePayment(property.getMonthlyRent()); // First month as advance

        booking.setStatus(Booking.BookingStatus.PENDING);
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Owner confirms booking request
     */
    public Booking confirmBooking(String bookingId, String ownerId) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending state!");
        }

        booking.setStatus(Booking.BookingStatus.OWNER_CONFIRMED);
        booking.setOwnerConfirmedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Owner rejects booking request
     */
    public Booking rejectBooking(String bookingId, String ownerId, String reason) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new RuntimeException("Booking is not in pending state!");
        }

        booking.setStatus(Booking.BookingStatus.OWNER_REJECTED);
        booking.setOwnerRejectionReason(reason);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Seeker submits government documents
     */
    public Booking submitDocuments(String bookingId, String seekerId, List<Booking.DocumentInfo> documents) {
        Booking booking = getBookingAndVerifySeeker(bookingId, seekerId);
        
        if (booking.getStatus() != Booking.BookingStatus.OWNER_CONFIRMED) {
            throw new RuntimeException("Booking must be confirmed by owner before submitting documents!");
        }

        if (documents == null || documents.isEmpty()) {
            throw new RuntimeException("Please submit at least one document!");
        }

        // Set upload timestamp for each document
        documents.forEach(doc -> doc.setUploadedAt(LocalDateTime.now()));

        booking.setSubmittedDocuments(documents);
        booking.setStatus(Booking.BookingStatus.DOCS_SUBMITTED);
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Owner verifies submitted documents
     */
    public Booking verifyDocuments(String bookingId, String ownerId, boolean approved, String note) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.DOCS_SUBMITTED) {
            throw new RuntimeException("Documents not submitted yet!");
        }

        if (approved) {
            booking.setStatus(Booking.BookingStatus.DOCS_VERIFIED);
            booking.setDocumentsVerified(true);
        } else {
            booking.setStatus(Booking.BookingStatus.DOCS_REJECTED);
            booking.setDocumentsVerified(false);
        }
        
        booking.setDocumentVerificationNote(note);
        booking.setDocumentsVerifiedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        return bookingRepository.save(booking);
    }

    /**
     * Owner requests payment after document verification
     */
    public Booking requestPayment(String bookingId, String ownerId) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.DOCS_VERIFIED) {
            throw new RuntimeException("Documents must be verified before requesting payment!");
        }

        booking.setStatus(Booking.BookingStatus.PAYMENT_PENDING);
        booking.setUpdatedAt(LocalDateTime.now());

        // Create payment record for advance
        Payment advancePayment = new Payment();
        advancePayment.setBookingId(bookingId);
        advancePayment.setPropertyId(booking.getPropertyId());
        advancePayment.setPropertyName(booking.getPropertyName());
        advancePayment.setSeekerId(booking.getSeekerId());
        advancePayment.setSeekerName(booking.getSeekerName());
        advancePayment.setSeekerEmail(booking.getSeekerEmail());
        advancePayment.setOwnerId(booking.getOwnerId());
        advancePayment.setOwnerName(booking.getOwnerName());
        advancePayment.setPaymentType(Payment.PaymentType.ADVANCE_PAYMENT);
        advancePayment.setAmount(booking.getAdvancePayment());
        advancePayment.setTotalAmount(booking.getAdvancePayment());
        advancePayment.setStatus(Payment.PaymentStatus.PENDING);
        advancePayment.setCreatedAt(LocalDateTime.now());
        advancePayment.setUpdatedAt(LocalDateTime.now());

        paymentRepository.save(advancePayment);

        return bookingRepository.save(booking);
    }

    /**
     * Confirm advance payment received (Owner action)
     */
    public Booking confirmAdvancePayment(String bookingId, String ownerId, String paymentMethod) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.PAYMENT_PENDING) {
            throw new RuntimeException("Booking is not in payment pending state!");
        }

        booking.setAdvancePaymentReceived(true);
        booking.setAdvancePaymentReceivedAt(LocalDateTime.now());
        booking.setPaymentMethod(paymentMethod);
        booking.setStatus(Booking.BookingStatus.ACTIVE);
        booking.setUpdatedAt(LocalDateTime.now());

        // Update payment record
        List<Payment> payments = paymentRepository.findByBookingIdAndPaymentType(bookingId, Payment.PaymentType.ADVANCE_PAYMENT);
        if (!payments.isEmpty()) {
            Payment advancePayment = payments.get(0);
            advancePayment.setStatus(Payment.PaymentStatus.COMPLETED);
            advancePayment.setPaidAt(LocalDateTime.now());
            advancePayment.setPaidDate(LocalDate.now());
            advancePayment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentMethod));
            advancePayment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(advancePayment);
        }

        // Decrease available rooms in property
        Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);
        if (property != null && property.getAvailableRooms() > 0) {
            property.setAvailableRooms(property.getAvailableRooms() - 1);
            property.setUpdatedAt(LocalDateTime.now());
            propertyRepository.save(property);
        }

        return bookingRepository.save(booking);
    }

    /**
     * Complete booking (Seeker moved out)
     */
    public Booking completeBooking(String bookingId, String ownerId, LocalDate checkOutDate) {
        Booking booking = getBookingAndVerifyOwner(bookingId, ownerId);
        
        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active!");
        }

        booking.setStatus(Booking.BookingStatus.COMPLETED);
        booking.setCheckOutDate(checkOutDate);
        booking.setUpdatedAt(LocalDateTime.now());

        // Increase available rooms in property
        Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);
        if (property != null) {
            property.setAvailableRooms(property.getAvailableRooms() + 1);
            property.setUpdatedAt(LocalDateTime.now());
            propertyRepository.save(property);
        }

        return bookingRepository.save(booking);
    }

    /**
     * Cancel booking
     */
    public Booking cancelBooking(String bookingId, String userId, String reason) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        
        String cancelledBy;
        if (booking.getSeekerId().equals(userId)) {
            cancelledBy = "SEEKER";
        } else if (booking.getOwnerId().equals(userId)) {
            cancelledBy = "OWNER";
        } else {
            throw new RuntimeException("You are not authorized to cancel this booking!");
        }

        // Can't cancel completed bookings
        if (booking.getStatus() == Booking.BookingStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed booking!");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledBy(cancelledBy);
        booking.setCancelledAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        // If booking was active, increase available rooms
        if (booking.getStatus() == Booking.BookingStatus.ACTIVE) {
            Property property = propertyRepository.findById(booking.getPropertyId()).orElse(null);
            if (property != null) {
                property.setAvailableRooms(property.getAvailableRooms() + 1);
                property.setUpdatedAt(LocalDateTime.now());
                propertyRepository.save(property);
            }
        }

        return bookingRepository.save(booking);
    }

    /**
     * Get booking by ID
     */
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
    }

    /**
     * Get all bookings for a seeker
     */
    public List<Booking> getSeekerBookings(String seekerId) {
        return bookingRepository.findBySeekerIdOrderByCreatedAtDesc(seekerId);
    }

    /**
     * Get all bookings for an owner
     */
    public List<Booking> getOwnerBookings(String ownerId) {
        return bookingRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    /**
     * Get bookings by status for owner
     */
    public List<Booking> getOwnerBookingsByStatus(String ownerId, Booking.BookingStatus status) {
        return bookingRepository.findByOwnerIdAndStatus(ownerId, status);
    }

    /**
     * Get bookings by status for seeker
     */
    public List<Booking> getSeekerBookingsByStatus(String seekerId, Booking.BookingStatus status) {
        return bookingRepository.findBySeekerIdAndStatus(seekerId, status);
    }

    /**
     * Get active booking for seeker
     */
    public Optional<Booking> getActiveSeekerBooking(String seekerId) {
        List<Booking> activeBookings = bookingRepository.findBySeekerIdAndStatus(seekerId, Booking.BookingStatus.ACTIVE);
        return activeBookings.isEmpty() ? Optional.empty() : Optional.of(activeBookings.get(0));
    }

    // Helper methods
    private Booking getBookingAndVerifyOwner(String bookingId, String ownerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        
        if (!booking.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to perform this action!");
        }
        return booking;
    }

    private Booking getBookingAndVerifySeeker(String bookingId, String seekerId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));
        
        if (!booking.getSeekerId().equals(seekerId)) {
            throw new RuntimeException("You are not authorized to perform this action!");
        }
        return booking;
    }

    // Statistics
    public BookingStatistics getOwnerBookingStatistics(String ownerId) {
        long total = bookingRepository.countByOwnerId(ownerId);
        long pending = bookingRepository.countByOwnerIdAndStatus(ownerId, Booking.BookingStatus.PENDING);
        long active = bookingRepository.countByOwnerIdAndStatus(ownerId, Booking.BookingStatus.ACTIVE);
        long completed = bookingRepository.countByOwnerIdAndStatus(ownerId, Booking.BookingStatus.COMPLETED);
        
        return new BookingStatistics(total, pending, active, completed);
    }

    public static class BookingStatistics {
        public final long totalBookings;
        public final long pendingBookings;
        public final long activeBookings;
        public final long completedBookings;

        public BookingStatistics(long totalBookings, long pendingBookings, long activeBookings, long completedBookings) {
            this.totalBookings = totalBookings;
            this.pendingBookings = pendingBookings;
            this.activeBookings = activeBookings;
            this.completedBookings = completedBookings;
        }
    }
}
