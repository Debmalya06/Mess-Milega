package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Booking;
import com.example.Mess_PgSathi.model.Payment;
import com.example.Mess_PgSathi.repository.BookingRepository;
import com.example.Mess_PgSathi.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    private static final double LATE_FEE_PER_DAY = 10.0; // ₹10 per day

    /**
     * Create monthly rent payment (called at start of each month)
     */
    public Payment createMonthlyRentPayment(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found!"));

        if (booking.getStatus() != Booking.BookingStatus.ACTIVE) {
            throw new RuntimeException("Booking is not active!");
        }

        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        // Check if payment already exists for this month
        if (paymentRepository.findByBookingIdAndPaymentMonthAndPaymentYear(bookingId, month, year).isPresent()) {
            throw new RuntimeException("Payment for this month already exists!");
        }

        Payment payment = new Payment();
        payment.setBookingId(bookingId);
        payment.setPropertyId(booking.getPropertyId());
        payment.setPropertyName(booking.getPropertyName());
        payment.setSeekerId(booking.getSeekerId());
        payment.setSeekerName(booking.getSeekerName());
        payment.setSeekerEmail(booking.getSeekerEmail());
        payment.setOwnerId(booking.getOwnerId());
        payment.setOwnerName(booking.getOwnerName());
        payment.setPaymentType(Payment.PaymentType.MONTHLY_RENT);
        payment.setAmount(booking.getMonthlyRent());
        payment.setTotalAmount(booking.getMonthlyRent());
        payment.setPaymentMonth(month);
        payment.setPaymentYear(year);
        payment.setDueDate(LocalDate.of(year, month, 10)); // Due on 10th
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setCreatedAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    /**
     * Record payment received
     */
    public Payment recordPayment(String paymentId, String ownerId, Payment.PaymentMethod paymentMethod, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        if (!payment.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to record this payment!");
        }

        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Payment already completed!");
        }

        payment.setPaidDate(LocalDate.now());
        payment.calculateLateCharges(); // Calculate late fees if any
        payment.setPaymentMethod(paymentMethod);
        payment.setTransactionId(transactionId);
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setPaidAt(LocalDateTime.now());
        payment.setUpdatedAt(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    /**
     * Get overdue payments for a seeker
     */
    public List<Payment> getOverduePayments(String seekerId) {
        return paymentRepository.findBySeekerIdAndStatusAndDueDateBefore(
                seekerId, 
                Payment.PaymentStatus.PENDING, 
                LocalDate.now()
        );
    }

    /**
     * Get all pending payments for a seeker
     */
    public List<Payment> getPendingPayments(String seekerId) {
        return paymentRepository.findBySeekerIdAndStatus(seekerId, Payment.PaymentStatus.PENDING);
    }

    /**
     * Get payment history for a booking
     */
    public List<Payment> getBookingPaymentHistory(String bookingId) {
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    /**
     * Get all payments for a seeker
     */
    public List<Payment> getSeekerPayments(String seekerId) {
        return paymentRepository.findBySeekerIdOrderByCreatedAtDesc(seekerId);
    }

    /**
     * Get all payments for an owner
     */
    public List<Payment> getOwnerPayments(String ownerId) {
        return paymentRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    /**
     * Calculate current late fee for a pending payment
     */
    public double calculateCurrentLateFee(String paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found!"));

        if (payment.getStatus() != Payment.PaymentStatus.PENDING) {
            return 0.0;
        }

        LocalDate today = LocalDate.now();
        if (today.isAfter(payment.getDueDate())) {
            long daysLate = java.time.temporal.ChronoUnit.DAYS.between(payment.getDueDate(), today);
            return daysLate * LATE_FEE_PER_DAY;
        }
        return 0.0;
    }

    /**
     * Get payment statistics for owner
     */
    public PaymentStatistics getOwnerPaymentStatistics(String ownerId) {
        List<Payment> allPayments = paymentRepository.findByOwnerId(ownerId);
        
        double totalReceived = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.COMPLETED)
                .mapToDouble(Payment::getTotalAmount)
                .sum();
        
        double totalPending = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PENDING)
                .mapToDouble(Payment::getTotalAmount)
                .sum();

        long pendingCount = paymentRepository.countByOwnerIdAndStatus(ownerId, Payment.PaymentStatus.PENDING);
        long completedCount = paymentRepository.countByOwnerIdAndStatus(ownerId, Payment.PaymentStatus.COMPLETED);

        return new PaymentStatistics(totalReceived, totalPending, pendingCount, completedCount);
    }

    /**
     * Scheduled task to create monthly rent payments for all active bookings
     * Runs on 1st of every month at midnight
     */
    @Scheduled(cron = "0 0 0 1 * *")
    public void generateMonthlyRentPayments() {
        List<Booking> activeBookings = bookingRepository.findByStatus(Booking.BookingStatus.ACTIVE);
        
        for (Booking booking : activeBookings) {
            try {
                createMonthlyRentPayment(booking.getId());
            } catch (Exception e) {
                // Log error but continue with other bookings
                System.err.println("Failed to create payment for booking: " + booking.getId() + " - " + e.getMessage());
            }
        }
    }

    /**
     * Scheduled task to update late fees daily
     * Runs every day at midnight
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void updateLateFeesDaily() {
        List<Payment> overduePayments = paymentRepository.findByStatusAndDueDateBefore(
                Payment.PaymentStatus.PENDING, 
                LocalDate.now()
        );

        for (Payment payment : overduePayments) {
            payment.setPaidDate(LocalDate.now()); // Temporary for calculation
            payment.calculateLateCharges();
            payment.setPaidDate(null); // Reset
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }
    }

    public static class PaymentStatistics {
        public final double totalReceived;
        public final double totalPending;
        public final long pendingPayments;
        public final long completedPayments;

        public PaymentStatistics(double totalReceived, double totalPending, long pendingPayments, long completedPayments) {
            this.totalReceived = totalReceived;
            this.totalPending = totalPending;
            this.pendingPayments = pendingPayments;
            this.completedPayments = completedPayments;
        }
    }
}
