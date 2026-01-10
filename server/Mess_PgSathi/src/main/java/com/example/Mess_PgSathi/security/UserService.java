package com.example.Mess_PgSathi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.payload.request.SignupRequest;
import com.example.Mess_PgSathi.repository.UserRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Check if email already exists
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // Get user by email
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Register new user (PG Owner or Room Finder)
    public User saveUser(SignupRequest request) {
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));
        user.setVerified(false); // Email OTP verification to be handled later
        return userRepository.save(user);
    }

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Delete user
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    // Update user details (profile update, etc.)
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    
}
