package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.Payment;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import com.example.Mess_PgSathi.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    // ===================== SEEKER ENDPOINTS =====================

    /**
     * Get seeker's payments
     */
    @GetMapping("/my-payments")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> getMyPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Payment> payments = paymentService.getSeekerPayments(userDetails.getId());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get pending payments
     */
    @GetMapping("/my-payments/pending")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> getMyPendingPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Payment> payments = paymentService.getPendingPayments(userDetails.getId());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get overdue payments
     */
    @GetMapping("/my-payments/overdue")
    @PreAuthorize("hasRole('ROOM_FINDER')")
    public ResponseEntity<?> getMyOverduePayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Payment> payments = paymentService.getOverduePayments(userDetails.getId());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get current late fee for a payment
     */
    @GetMapping("/{paymentId}/late-fee")
    @PreAuthorize("hasRole('ROOM_FINDER') or hasRole('PG_OWNER')")
    public ResponseEntity<?> getLateFee(@PathVariable String paymentId) {
        try {
            double lateFee = paymentService.calculateCurrentLateFee(paymentId);
            Map<String, Object> response = new HashMap<>();
            response.put("paymentId", paymentId);
            response.put("lateFee", lateFee);
            response.put("lateFeePerDay", 10.0);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== OWNER ENDPOINTS =====================

    /**
     * Get owner's received payments
     */
    @GetMapping("/owner/payments")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getOwnerPayments(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            List<Payment> payments = paymentService.getOwnerPayments(userDetails.getId());
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Record payment received (Owner)
     */
    @PostMapping("/{paymentId}/record")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> recordPayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String paymentId,
            @RequestParam String paymentMethod,
            @RequestParam(required = false) String transactionId) {
        try {
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(paymentMethod.toUpperCase());
            Payment payment = paymentService.recordPayment(
                    paymentId, 
                    userDetails.getId(), 
                    method, 
                    transactionId
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Create monthly rent payment for a booking (Owner)
     */
    @PostMapping("/create-monthly/{bookingId}")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> createMonthlyPayment(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable String bookingId) {
        try {
            Payment payment = paymentService.createMonthlyRentPayment(bookingId);
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Get payment statistics (Owner)
     */
    @GetMapping("/owner/statistics")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getOwnerPaymentStatistics(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            PaymentService.PaymentStatistics stats = paymentService.getOwnerPaymentStatistics(userDetails.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // ===================== COMMON ENDPOINTS =====================

    /**
     * Get payment history for a booking
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('ROOM_FINDER') or hasRole('PG_OWNER')")
    public ResponseEntity<?> getBookingPaymentHistory(@PathVariable String bookingId) {
        try {
            List<Payment> payments = paymentService.getBookingPaymentHistory(bookingId);
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
