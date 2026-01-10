package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Inquiry;
import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.repository.InquiryRepository;
import com.example.Mess_PgSathi.repository.PropertyRepository;
import com.example.Mess_PgSathi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InquiryService {

    private final InquiryRepository inquiryRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /**
     * Send inquiry to property owner
     */
    public Inquiry sendInquiry(String seekerId, String propertyId, String subject, String message, Inquiry.InquiryType inquiryType) {
        // Verify seeker exists
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        // Verify property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found!"));

        // Get owner
        User owner = userRepository.findById(property.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Property owner not found!"));

        Inquiry inquiry = new Inquiry();
        inquiry.setPropertyId(propertyId);
        inquiry.setPropertyName(property.getName());
        
        inquiry.setSeekerId(seekerId);
        inquiry.setSeekerName(seeker.getFullName());
        inquiry.setSeekerEmail(seeker.getEmail());
        inquiry.setSeekerPhone(seeker.getPhoneNumber());
        
        inquiry.setOwnerId(property.getOwnerId());
        inquiry.setOwnerName(owner.getFullName());
        inquiry.setOwnerEmail(owner.getEmail());
        
        inquiry.setSubject(subject);
        inquiry.setMessage(message);
        inquiry.setInquiryType(inquiryType != null ? inquiryType : Inquiry.InquiryType.GENERAL);
        inquiry.setStatus(Inquiry.InquiryStatus.PENDING);
        
        // Add initial message to thread
        Inquiry.InquiryMessage initialMessage = new Inquiry.InquiryMessage();
        initialMessage.setSenderId(seekerId);
        initialMessage.setSenderName(seeker.getFullName());
        initialMessage.setSenderRole("SEEKER");
        initialMessage.setMessage(message);
        initialMessage.setSentAt(LocalDateTime.now());
        inquiry.getMessages().add(initialMessage);
        
        inquiry.setCreatedAt(LocalDateTime.now());
        inquiry.setUpdatedAt(LocalDateTime.now());

        return inquiryRepository.save(inquiry);
    }

    /**
     * Reply to inquiry
     */
    public Inquiry replyToInquiry(String inquiryId, String userId, String message) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found!"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        String senderRole;
        if (inquiry.getSeekerId().equals(userId)) {
            senderRole = "SEEKER";
        } else if (inquiry.getOwnerId().equals(userId)) {
            senderRole = "OWNER";
            // Update status to responded if owner is replying
            if (inquiry.getStatus() == Inquiry.InquiryStatus.PENDING) {
                inquiry.setStatus(Inquiry.InquiryStatus.RESPONDED);
                inquiry.setRespondedAt(LocalDateTime.now());
            }
        } else {
            throw new RuntimeException("You are not part of this inquiry!");
        }

        Inquiry.InquiryMessage newMessage = new Inquiry.InquiryMessage();
        newMessage.setSenderId(userId);
        newMessage.setSenderName(user.getFullName());
        newMessage.setSenderRole(senderRole);
        newMessage.setMessage(message);
        newMessage.setSentAt(LocalDateTime.now());
        
        inquiry.getMessages().add(newMessage);
        inquiry.setUpdatedAt(LocalDateTime.now());

        return inquiryRepository.save(inquiry);
    }

    /**
     * Close inquiry
     */
    public Inquiry closeInquiry(String inquiryId, String userId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found!"));

        if (!inquiry.getSeekerId().equals(userId) && !inquiry.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to close this inquiry!");
        }

        inquiry.setStatus(Inquiry.InquiryStatus.CLOSED);
        inquiry.setUpdatedAt(LocalDateTime.now());

        return inquiryRepository.save(inquiry);
    }

    /**
     * Mark messages as read
     */
    public Inquiry markAsRead(String inquiryId, String userId) {
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found!"));

        // Mark all messages from other party as read
        inquiry.getMessages().forEach(msg -> {
            if (!msg.getSenderId().equals(userId)) {
                msg.setRead(true);
            }
        });

        inquiry.setUpdatedAt(LocalDateTime.now());
        return inquiryRepository.save(inquiry);
    }

    /**
     * Get inquiry by ID
     */
    public Inquiry getInquiryById(String inquiryId) {
        return inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Inquiry not found!"));
    }

    /**
     * Get all inquiries for seeker
     */
    public List<Inquiry> getSeekerInquiries(String seekerId) {
        return inquiryRepository.findBySeekerIdOrderByCreatedAtDesc(seekerId);
    }

    /**
     * Get all inquiries for owner
     */
    public List<Inquiry> getOwnerInquiries(String ownerId) {
        return inquiryRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
    }

    /**
     * Get pending inquiries for owner
     */
    public List<Inquiry> getPendingInquiries(String ownerId) {
        return inquiryRepository.findByOwnerIdAndStatus(ownerId, Inquiry.InquiryStatus.PENDING);
    }

    /**
     * Get inquiries for a property
     */
    public List<Inquiry> getPropertyInquiries(String propertyId) {
        return inquiryRepository.findByPropertyIdOrderByCreatedAtDesc(propertyId);
    }

    /**
     * Get unread count for user
     */
    public long getUnreadCount(String userId) {
        List<Inquiry> userInquiries;
        
        // Check if user is owner or seeker
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return 0;

        if (user.getRole() == User.Role.PG_OWNER) {
            userInquiries = inquiryRepository.findByOwnerId(userId);
        } else {
            userInquiries = inquiryRepository.findBySeekerId(userId);
        }

        return userInquiries.stream()
                .flatMap(inquiry -> inquiry.getMessages().stream())
                .filter(msg -> !msg.getSenderId().equals(userId) && !msg.isRead())
                .count();
    }
}
