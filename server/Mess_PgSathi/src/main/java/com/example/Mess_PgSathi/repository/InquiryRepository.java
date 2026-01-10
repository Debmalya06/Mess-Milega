package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Inquiry;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InquiryRepository extends MongoRepository<Inquiry, String> {
    
    // Find by seeker
    List<Inquiry> findBySeekerId(String seekerId);
    List<Inquiry> findBySeekerIdOrderByCreatedAtDesc(String seekerId);
    List<Inquiry> findBySeekerIdAndStatus(String seekerId, Inquiry.InquiryStatus status);
    
    // Find by owner
    List<Inquiry> findByOwnerId(String ownerId);
    List<Inquiry> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    List<Inquiry> findByOwnerIdAndStatus(String ownerId, Inquiry.InquiryStatus status);
    
    // Find by property
    List<Inquiry> findByPropertyId(String propertyId);
    List<Inquiry> findByPropertyIdOrderByCreatedAtDesc(String propertyId);
    
    // Find by status
    List<Inquiry> findByStatus(Inquiry.InquiryStatus status);
    
    // Find by inquiry type
    List<Inquiry> findByInquiryType(Inquiry.InquiryType inquiryType);
    List<Inquiry> findByOwnerIdAndInquiryType(String ownerId, Inquiry.InquiryType inquiryType);
    
    // Count methods
    long countByOwnerId(String ownerId);
    long countByOwnerIdAndStatus(String ownerId, Inquiry.InquiryStatus status);
    long countBySeekerId(String seekerId);
    long countByPropertyId(String propertyId);
}
