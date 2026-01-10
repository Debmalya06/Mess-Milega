package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {
    
    // Find by seeker
    List<Booking> findBySeekerId(String seekerId);
    List<Booking> findBySeekerIdAndStatus(String seekerId, Booking.BookingStatus status);
    List<Booking> findBySeekerIdOrderByCreatedAtDesc(String seekerId);
    
    // Find by owner
    List<Booking> findByOwnerId(String ownerId);
    List<Booking> findByOwnerIdAndStatus(String ownerId, Booking.BookingStatus status);
    List<Booking> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    
    // Find by property
    List<Booking> findByPropertyId(String propertyId);
    List<Booking> findByPropertyIdAndStatus(String propertyId, Booking.BookingStatus status);
    
    // Find active bookings
    List<Booking> findByStatus(Booking.BookingStatus status);
    List<Booking> findByPropertyIdAndStatusIn(String propertyId, List<Booking.BookingStatus> statuses);
    
    // Check existing booking
    Optional<Booking> findBySeekerIdAndPropertyIdAndStatusIn(String seekerId, String propertyId, List<Booking.BookingStatus> statuses);
    boolean existsBySeekerIdAndPropertyIdAndStatusIn(String seekerId, String propertyId, List<Booking.BookingStatus> statuses);
    
    // Find by date range
    List<Booking> findByCheckInDateBetween(LocalDate startDate, LocalDate endDate);
    List<Booking> findByOwnerIdAndCheckInDateBetween(String ownerId, LocalDate startDate, LocalDate endDate);
    
    // Count methods
    long countByOwnerId(String ownerId);
    long countByOwnerIdAndStatus(String ownerId, Booking.BookingStatus status);
    long countBySeekerId(String seekerId);
    long countBySeekerIdAndStatus(String seekerId, Booking.BookingStatus status);
    long countByPropertyId(String propertyId);
    long countByPropertyIdAndStatus(String propertyId, Booking.BookingStatus status);
}
