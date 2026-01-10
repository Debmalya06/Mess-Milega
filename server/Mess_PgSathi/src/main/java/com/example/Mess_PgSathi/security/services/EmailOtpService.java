package com.example.Mess_PgSathi.security.services;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;
import java.time.Duration;

@Service
public class EmailOtpService {

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private static final int OTP_EXPIRY_MINUTES = 5;

    private static class OtpData {
        String otp;
        LocalDateTime createdAt;
        int attempts;

        OtpData(String otp) {
            this.otp = otp;
            this.createdAt = LocalDateTime.now();
            this.attempts = 0;
        }
    }

    public String generateOtp(String email) {
        // Generate 6-digit OTP
        String otp = String.format("%06d", random.nextInt(999999));
        otpStorage.put(email, new OtpData(otp));
        
        // Clean up old OTPs
        cleanupExpiredOtps();
        
        System.out.println("Generated OTP for " + email + ": " + otp); // For testing - remove in production
        return otp;
    }

    public boolean verifyOtp(String email, String inputOtp) {
        OtpData stored = otpStorage.get(email);
        
        if (stored == null) {
            System.out.println("No OTP found for email: " + email);
            return false; // No OTP found
        }

        // Check if OTP is expired
        if (Duration.between(stored.createdAt, LocalDateTime.now()).toMinutes() > OTP_EXPIRY_MINUTES) {
            otpStorage.remove(email);
            System.out.println("OTP expired for email: " + email);
            return false; // Expired
        }

        // Check attempts (max 3 attempts)
        stored.attempts++;
        if (stored.attempts > 3) {
            otpStorage.remove(email);
            System.out.println("Too many attempts for email: " + email);
            return false; // Too many attempts
        }

        boolean isValid = stored.otp.equals(inputOtp);
        
        if (isValid) {
            otpStorage.remove(email); // Remove after successful verification
            System.out.println("OTP verified successfully for email: " + email);
        } else {
            System.out.println("Invalid OTP for email: " + email + ". Attempt: " + stored.attempts);
        }
        
        return isValid;
    }

    public boolean isOtpExists(String email) {
        OtpData stored = otpStorage.get(email);
        if (stored == null) {
            return false;
        }
        
        // Check if expired
        if (Duration.between(stored.createdAt, LocalDateTime.now()).toMinutes() > OTP_EXPIRY_MINUTES) {
            otpStorage.remove(email);
            return false;
        }
        
        return true;
    }

    private void cleanupExpiredOtps() {
        LocalDateTime now = LocalDateTime.now();
        otpStorage.entrySet().removeIf(entry -> 
            Duration.between(entry.getValue().createdAt, now).toMinutes() > OTP_EXPIRY_MINUTES
        );
        System.out.println("Cleaned up expired OTPs. Current active OTPs: " + otpStorage.size());
    }

    public void clearOtp(String email) {
        otpStorage.remove(email);
        System.out.println("OTP cleared for email: " + email);
    }
}