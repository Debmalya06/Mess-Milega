package com.example.Mess_PgSathi.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import com.example.Mess_PgSathi.payload.request.LoginRequest;
import com.example.Mess_PgSathi.payload.request.SignupRequest;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.repository.UserRepository;
import com.example.Mess_PgSathi.security.UserService;
import com.example.Mess_PgSathi.security.jwt.JwtUtils;
import com.example.Mess_PgSathi.security.services.EmailOtpService;
import com.example.Mess_PgSathi.security.services.EmailService;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import com.example.Mess_PgSathi.payload.response.JwtResponse;
import com.example.Mess_PgSathi.model.User;

import jakarta.validation.Valid;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final EmailOtpService emailOtpService;
    private final EmailService emailService;
    private final UserService userService;

    // ================== REGISTRATION FLOW ==================
    
    /**
     * Step 1: Register user with details (user is unverified)
     * Flow: Register → Send OTP → Verify OTP → Login
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        System.out.println("DEBUG: /api/auth/register endpoint hit. Email: " + signUpRequest.getEmail());

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Email is already in use!"));
        }

        try {
            // Save new user (unverified)
            User user = new User();
            user.setFullName(signUpRequest.getFullName());
            user.setEmail(signUpRequest.getEmail());
            user.setPhoneNumber(signUpRequest.getPhoneNumber());
            user.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
            user.setRole(User.Role.valueOf(signUpRequest.getRole().toUpperCase()));
            user.setVerified(false); // User is NOT verified yet

            userRepository.save(user);
            
            // Try to send OTP for verification
            String otp = emailOtpService.generateOtp(user.getEmail());
            try {
                emailService.sendOtpEmail(user.getEmail(), otp);
                return ResponseEntity.ok(new MessageResponse("Registration successful! OTP sent to " + user.getEmail() + ". Please verify your email."));
            } catch (Exception emailEx) {
                // Email failed but user is registered - log OTP for development
                System.out.println("========================================");
                System.out.println("EMAIL FAILED - DEV MODE OTP for " + user.getEmail() + ": " + otp);
                System.out.println("========================================");
                return ResponseEntity.ok(new MessageResponse("Registration successful! OTP: " + otp + " (Email service unavailable - showing OTP for testing)"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Registration failed: " + e.getMessage()));
        }
    }

    /**
     * Step 2: Verify email with OTP
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required!"));
        }
        
        if (otp == null || otp.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("OTP is required!"));
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
            }

            User user = userOpt.get();
            
            if (user.isVerified()) {
                return ResponseEntity.ok(new MessageResponse("Email is already verified. You can login now."));
            }

            // Verify OTP
            if (!emailOtpService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired OTP!"));
            }

            // Mark user as verified
            user.setVerified(true);
            userRepository.save(user);
            
            // Send welcome email
            emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
            
            return ResponseEntity.ok(new MessageResponse("Email verified successfully! You can now login."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Verification failed. Please try again."));
        }
    }

    /**
     * Resend OTP for email verification
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendVerificationOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required!"));
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found! Please register first."));
            }

            User user = userOpt.get();
            
            if (user.isVerified()) {
                return ResponseEntity.ok(new MessageResponse("Email is already verified. You can login now."));
            }

            String otp = emailOtpService.generateOtp(email);
            try {
                emailService.sendOtpEmail(email, otp);
                return ResponseEntity.ok(new MessageResponse("OTP resent to " + email));
            } catch (Exception emailEx) {
                System.out.println("EMAIL FAILED - DEV MODE OTP for " + email + ": " + otp);
                return ResponseEntity.ok(new MessageResponse("OTP: " + otp + " (Email service unavailable)"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to resend OTP. Please try again."));
        }
    }

    // ================== LOGIN FLOW ==================

    /**
     * Step 3: Login (only verified users can login)
     */
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Check if user exists
            Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
            }

            User user = userOpt.get();
            
            // Check if user is verified
            if (!user.isVerified()) {
                // Send OTP for verification
                String otp = emailOtpService.generateOtp(user.getEmail());
                emailService.sendOtpEmail(user.getEmail(), otp);
                return ResponseEntity.badRequest().body(new MessageResponse("Email not verified! OTP sent to your email. Please verify first."));
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );

            // Generate JWT
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String jwt = jwtUtils.generateJwtToken(authentication);

            return ResponseEntity.ok(new JwtResponse(jwt,
                    userDetails.getId(),
                    userDetails.getUsername(),
                    userDetails.getEmail()));
                    
        } catch (BadCredentialsException e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Invalid email or password!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Login failed. Please try again."));
        }
    }

    /**
     * Check if email exists (for frontend validation)
     */
    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required!"));
        }

        boolean exists = userRepository.existsByEmail(email);
        return ResponseEntity.ok(Map.of(
            "exists", exists,
            "message", exists ? "Email is already registered" : "Email is available"
        ));
    }

    /**
     * Forgot password - Send OTP
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required!"));
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found with this email!"));
            }

            String otp = emailOtpService.generateOtp(email);
            emailService.sendOtpEmail(email, otp);
            
            return ResponseEntity.ok(new MessageResponse("Password reset OTP sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Failed to send OTP. Please try again."));
        }
    }

    /**
     * Reset password with OTP
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("newPassword");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required!"));
        }
        if (otp == null || otp.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("OTP is required!"));
        }
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(new MessageResponse("Password must be at least 6 characters!"));
        }

        try {
            Optional<User> userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("User not found!"));
            }

            // Verify OTP
            if (!emailOtpService.verifyOtp(email, otp)) {
                return ResponseEntity.badRequest().body(new MessageResponse("Invalid or expired OTP!"));
            }

            User user = userOpt.get();
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            
            return ResponseEntity.ok(new MessageResponse("Password reset successfully! You can now login."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Password reset failed. Please try again."));
        }
    }
}
