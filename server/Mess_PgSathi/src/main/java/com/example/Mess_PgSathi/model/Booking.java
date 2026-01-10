package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
    @Id
    private String id;

    // Property Information
    private String propertyId;
    private String propertyName;
    private String propertyAddress;
    private String roomType;

    // Seeker Information
    private String seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerPhone;

    // Owner Information
    private String ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;

    // Booking Details
    private LocalDate checkInDate;
    private LocalDate checkOutDate; // Optional - for temporary stays
    private int numberOfMonths; // Expected stay duration
    private double monthlyRent;
    private double securityDeposit;
    private double advancePayment;

    // Booking Status Flow
    private BookingStatus status = BookingStatus.PENDING;

    // Document Verification
    private List<DocumentInfo> submittedDocuments = new ArrayList<>();
    private boolean documentsVerified = false;
    private String documentVerificationNote;
    private LocalDateTime documentsVerifiedAt;

    // Owner Actions
    private String ownerRejectionReason;
    private LocalDateTime ownerConfirmedAt;

    // Payment Information
    private boolean advancePaymentReceived = false;
    private LocalDateTime advancePaymentReceivedAt;
    private String paymentMethod; // UPI, BANK_TRANSFER, CASH

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Cancellation
    private String cancellationReason;
    private String cancelledBy; // SEEKER, OWNER
    private LocalDateTime cancelledAt;

    public enum BookingStatus {
        PENDING,              // Initial request by seeker
        OWNER_CONFIRMED,      // Owner accepted the booking request
        OWNER_REJECTED,       // Owner rejected the booking
        DOCS_SUBMITTED,       // Seeker submitted government documents
        DOCS_VERIFIED,        // Owner verified documents
        DOCS_REJECTED,        // Owner rejected documents
        PAYMENT_PENDING,      // Waiting for advance payment
        ACTIVE,               // Booking is active (seeker moved in)
        COMPLETED,            // Booking completed (seeker moved out)
        CANCELLED             // Booking cancelled
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentInfo {
        private String documentId;
        private String documentType; // AADHAR, PAN, PASSPORT, DRIVING_LICENSE, VOTER_ID
        private String documentUrl;
        private String documentNumber;
        private LocalDateTime uploadedAt;
        private boolean verified = false;
        private String verificationNote;
    }
}
