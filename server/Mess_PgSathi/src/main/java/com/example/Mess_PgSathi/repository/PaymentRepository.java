package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    
    // Find by booking
    List<Payment> findByBookingId(String bookingId);
    List<Payment> findByBookingIdAndStatus(String bookingId, Payment.PaymentStatus status);
    List<Payment> findByBookingIdOrderByCreatedAtDesc(String bookingId);
    
    // Find by seeker
    List<Payment> findBySeekerId(String seekerId);
    List<Payment> findBySeekerIdAndStatus(String seekerId, Payment.PaymentStatus status);
    List<Payment> findBySeekerIdOrderByCreatedAtDesc(String seekerId);
    
    // Find by owner
    List<Payment> findByOwnerId(String ownerId);
    List<Payment> findByOwnerIdAndStatus(String ownerId, Payment.PaymentStatus status);
    List<Payment> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    
    // Find by property
    List<Payment> findByPropertyId(String propertyId);
    
    // Find by payment type
    List<Payment> findByPaymentType(Payment.PaymentType paymentType);
    List<Payment> findByBookingIdAndPaymentType(String bookingId, Payment.PaymentType paymentType);
    
    // Find pending payments
    List<Payment> findByStatus(Payment.PaymentStatus status);
    List<Payment> findBySeekerIdAndStatusAndPaymentType(String seekerId, Payment.PaymentStatus status, Payment.PaymentType paymentType);
    
    // Find overdue payments (due date passed but not paid)
    List<Payment> findByStatusAndDueDateBefore(Payment.PaymentStatus status, LocalDate date);
    List<Payment> findBySeekerIdAndStatusAndDueDateBefore(String seekerId, Payment.PaymentStatus status, LocalDate date);
    
    // Find by month/year (for monthly rent)
    Optional<Payment> findByBookingIdAndPaymentMonthAndPaymentYear(String bookingId, int month, int year);
    List<Payment> findByOwnerIdAndPaymentMonthAndPaymentYear(String ownerId, int month, int year);
    
    // Transaction lookup
    Optional<Payment> findByTransactionId(String transactionId);
    Optional<Payment> findByPaymentGatewayOrderId(String orderId);
    
    // Count methods
    long countByOwnerId(String ownerId);
    long countByOwnerIdAndStatus(String ownerId, Payment.PaymentStatus status);
    long countBySeekerId(String seekerId);
    long countBySeekerIdAndStatus(String seekerId, Payment.PaymentStatus status);
}
