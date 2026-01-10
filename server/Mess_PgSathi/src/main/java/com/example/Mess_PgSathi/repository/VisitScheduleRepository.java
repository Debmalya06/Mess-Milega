package com.example.Mess_PgSathi.repository;

import com.example.Mess_PgSathi.model.VisitSchedule;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface VisitScheduleRepository extends MongoRepository<VisitSchedule, String> {
    
    // Find by seeker
    List<VisitSchedule> findBySeekerId(String seekerId);
    List<VisitSchedule> findBySeekerIdOrderByVisitDateDesc(String seekerId);
    List<VisitSchedule> findBySeekerIdAndStatus(String seekerId, VisitSchedule.VisitStatus status);
    
    // Find by owner
    List<VisitSchedule> findByOwnerId(String ownerId);
    List<VisitSchedule> findByOwnerIdOrderByVisitDateDesc(String ownerId);
    List<VisitSchedule> findByOwnerIdAndStatus(String ownerId, VisitSchedule.VisitStatus status);
    
    // Find by property
    List<VisitSchedule> findByPropertyId(String propertyId);
    List<VisitSchedule> findByPropertyIdAndStatus(String propertyId, VisitSchedule.VisitStatus status);
    
    // Find by date
    List<VisitSchedule> findByVisitDate(LocalDate visitDate);
    List<VisitSchedule> findByOwnerIdAndVisitDate(String ownerId, LocalDate visitDate);
    List<VisitSchedule> findByVisitDateBetween(LocalDate startDate, LocalDate endDate);
    List<VisitSchedule> findByOwnerIdAndVisitDateBetween(String ownerId, LocalDate startDate, LocalDate endDate);
    
    // Find upcoming visits
    List<VisitSchedule> findByOwnerIdAndStatusAndVisitDateGreaterThanEqual(String ownerId, VisitSchedule.VisitStatus status, LocalDate date);
    List<VisitSchedule> findBySeekerIdAndStatusAndVisitDateGreaterThanEqual(String seekerId, VisitSchedule.VisitStatus status, LocalDate date);
    
    // Find by status
    List<VisitSchedule> findByStatus(VisitSchedule.VisitStatus status);
    
    // Count methods
    long countByOwnerId(String ownerId);
    long countByOwnerIdAndStatus(String ownerId, VisitSchedule.VisitStatus status);
    long countBySeekerId(String seekerId);
    long countByPropertyId(String propertyId);
    long countByOwnerIdAndVisitDate(String ownerId, LocalDate visitDate);
}
