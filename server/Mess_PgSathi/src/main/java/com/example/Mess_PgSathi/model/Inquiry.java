package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "inquiries")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inquiry {
    @Id
    private String id;

    // Property Information
    private String propertyId;
    private String propertyName;

    // Seeker (Sender) Information
    private String seekerId;
    private String seekerName;
    private String seekerEmail;
    private String seekerPhone;

    // Owner (Receiver) Information
    private String ownerId;
    private String ownerName;
    private String ownerEmail;

    // Inquiry Details
    private String subject;
    private String message;
    private InquiryType inquiryType;

    // Status
    private InquiryStatus status = InquiryStatus.PENDING;

    // Conversation Thread
    private List<InquiryMessage> messages = new ArrayList<>();

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime respondedAt;

    public enum InquiryType {
        GENERAL,
        AVAILABILITY,
        PRICING,
        AMENITIES,
        VISIT_REQUEST,
        BOOKING_QUERY,
        OTHER
    }

    public enum InquiryStatus {
        PENDING,
        RESPONDED,
        CLOSED,
        SPAM
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InquiryMessage {
        private String senderId;
        private String senderName;
        private String senderRole; // SEEKER, OWNER
        private String message;
        private LocalDateTime sentAt;
        private boolean read = false;
    }
}
