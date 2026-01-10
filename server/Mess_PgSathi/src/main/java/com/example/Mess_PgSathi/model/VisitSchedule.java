package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Document(collection = "visit_schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VisitSchedule {
    @Id
    private String id;

    // Property Information
    private String propertyId;
    private String propertyName;
    private String propertyAddress;
    private String propertyCity;

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

    // Visit Details
    private LocalDate visitDate;
    private LocalTime visitTime;
    private int durationMinutes = 30; // Expected duration
    private String visitPurpose; // First visit, Re-visit, Final inspection

    // Status
    private VisitStatus status = VisitStatus.PENDING;

    // Notes
    private String seekerNote; // Seeker's message to owner
    private String ownerNote; // Owner's response/instructions
    private String visitFeedback; // Feedback after visit

    // Reschedule Information
    private String rescheduleReason;
    private LocalDate originalDate;
    private LocalTime originalTime;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;

    // Cancellation
    private String cancellationReason;
    private String cancelledBy; // SEEKER, OWNER

    public enum VisitStatus {
        PENDING,           // Waiting for owner confirmation
        CONFIRMED,         // Owner confirmed the visit
        RESCHEDULED,       // Visit rescheduled
        COMPLETED,         // Visit completed
        CANCELLED,         // Visit cancelled
        NO_SHOW            // Seeker didn't show up
    }
}
