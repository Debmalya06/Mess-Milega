package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Payment {
    @Id
    private String id;

    // Booking Reference
    private String bookingId;
    private String propertyId;
    private String propertyName;

    // Payer Information (Seeker)
    private String seekerId;
    private String seekerName;
    private String seekerEmail;

    // Receiver Information (Owner)
    private String ownerId;
    private String ownerName;

    // Payment Details
    private PaymentType paymentType;
    private double amount;
    private double lateCharges = 0.0; // ₹10 per day after 10th
    private double totalAmount;
    private String currency = "INR";

    // For Monthly Rent
    private int paymentMonth; // 1-12
    private int paymentYear;
    private LocalDate dueDate; // 10th of each month
    private LocalDate paidDate;
    private int daysLate = 0;

    // Payment Status
    private PaymentStatus status = PaymentStatus.PENDING;

    // Payment Method
    private PaymentMethod paymentMethod;
    private String transactionId;
    private String paymentGatewayOrderId;
    private String paymentGatewayPaymentId;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime paidAt;

    // Remarks
    private String remarks;
    private String failureReason;

    public enum PaymentType {
        SECURITY_DEPOSIT,
        ADVANCE_PAYMENT,
        MONTHLY_RENT,
        LATE_FEE,
        MAINTENANCE,
        OTHER
    }

    public enum PaymentStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED,
        REFUNDED,
        CANCELLED
    }

    public enum PaymentMethod {
        UPI,
        BANK_TRANSFER,
        DEBIT_CARD,
        CREDIT_CARD,
        NET_BANKING,
        CASH,
        WALLET
    }

    // Calculate late charges (₹10 per day after 10th)
    public void calculateLateCharges() {
        if (paidDate != null && dueDate != null && paidDate.isAfter(dueDate)) {
            long daysAfterDue = java.time.temporal.ChronoUnit.DAYS.between(dueDate, paidDate);
            this.daysLate = (int) daysAfterDue;
            this.lateCharges = daysAfterDue * 10.0; // ₹10 per day
            this.totalAmount = this.amount + this.lateCharges;
        } else {
            this.daysLate = 0;
            this.lateCharges = 0.0;
            this.totalAmount = this.amount;
        }
    }
}
