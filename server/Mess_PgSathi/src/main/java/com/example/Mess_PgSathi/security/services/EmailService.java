package com.example.Mess_PgSathi.security.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("MessSathi - Verification Code");
            message.setText("Your MessSathi verification code is: " + otp + "\n\n" +
                    "This code is valid for 5 minutes. Do not share this code with anyone.\n\n" +
                    "If you didn't request this code, please ignore this email.\n\n" +
                    "Thanks,\nMessSathi Team");

            mailSender.send(message);
            System.out.println("OTP email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send OTP email to " + toEmail + ": " + e.getMessage());
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to MessSathi!");
            message.setText("Dear " + fullName + ",\n\n" +
                    "Welcome to MessSathi! Your account has been created successfully.\n\n" +
                    "You can now:\n" +
                    "- Browse PG accommodations\n" +
                    "- Connect with PG owners\n" +
                    "- Book your ideal stay\n\n" +
                    "Start exploring now and find your perfect PG accommodation!\n\n" +
                    "Best regards,\n" +
                    "MessSathi Team");

            mailSender.send(message);
            System.out.println("Welcome email sent successfully to: " + toEmail);
            
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            // Don't throw exception for welcome email failure
        }
    }
}