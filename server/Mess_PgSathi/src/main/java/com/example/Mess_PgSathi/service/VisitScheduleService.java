package com.example.Mess_PgSathi.service;

import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.model.User;
import com.example.Mess_PgSathi.model.VisitSchedule;
import com.example.Mess_PgSathi.repository.PropertyRepository;
import com.example.Mess_PgSathi.repository.UserRepository;
import com.example.Mess_PgSathi.repository.VisitScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VisitScheduleService {

    private final VisitScheduleRepository visitScheduleRepository;
    private final PropertyRepository propertyRepository;
    private final UserRepository userRepository;

    /**
     * Schedule a property visit (Seeker action)
     */
    public VisitSchedule scheduleVisit(String seekerId, String propertyId, LocalDate visitDate, 
                                       LocalTime visitTime, String visitPurpose, String seekerNote) {
        // Verify seeker exists
        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        if (!seeker.getRole().equals(User.Role.ROOM_FINDER)) {
            throw new RuntimeException("Only room finders can schedule visits!");
        }

        // Verify property exists
        Property property = propertyRepository.findById(propertyId)
                .orElseThrow(() -> new RuntimeException("Property not found!"));

        // Get owner
        User owner = userRepository.findById(property.getOwnerId())
                .orElseThrow(() -> new RuntimeException("Property owner not found!"));

        // Validate date is not in past
        if (visitDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot schedule visit for a past date!");
        }

        VisitSchedule visit = new VisitSchedule();
        visit.setPropertyId(propertyId);
        visit.setPropertyName(property.getName());
        visit.setPropertyAddress(property.getAddress());
        visit.setPropertyCity(property.getCity());

        visit.setSeekerId(seekerId);
        visit.setSeekerName(seeker.getFullName());
        visit.setSeekerEmail(seeker.getEmail());
        visit.setSeekerPhone(seeker.getPhoneNumber());

        visit.setOwnerId(property.getOwnerId());
        visit.setOwnerName(owner.getFullName());
        visit.setOwnerEmail(owner.getEmail());
        visit.setOwnerPhone(owner.getPhoneNumber());

        visit.setVisitDate(visitDate);
        visit.setVisitTime(visitTime);
        visit.setVisitPurpose(visitPurpose != null ? visitPurpose : "First visit");
        visit.setSeekerNote(seekerNote);

        visit.setStatus(VisitSchedule.VisitStatus.PENDING);
        visit.setCreatedAt(LocalDateTime.now());
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Owner confirms visit
     */
    public VisitSchedule confirmVisit(String visitId, String ownerId, String ownerNote) {
        VisitSchedule visit = getVisitAndVerifyOwner(visitId, ownerId);

        if (visit.getStatus() != VisitSchedule.VisitStatus.PENDING && 
            visit.getStatus() != VisitSchedule.VisitStatus.RESCHEDULED) {
            throw new RuntimeException("Visit cannot be confirmed in current state!");
        }

        visit.setStatus(VisitSchedule.VisitStatus.CONFIRMED);
        visit.setOwnerNote(ownerNote);
        visit.setConfirmedAt(LocalDateTime.now());
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Reschedule visit (by either party)
     */
    public VisitSchedule rescheduleVisit(String visitId, String userId, LocalDate newDate, 
                                         LocalTime newTime, String reason) {
        VisitSchedule visit = visitScheduleRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found!"));

        if (!visit.getSeekerId().equals(userId) && !visit.getOwnerId().equals(userId)) {
            throw new RuntimeException("You are not authorized to reschedule this visit!");
        }

        if (visit.getStatus() == VisitSchedule.VisitStatus.COMPLETED || 
            visit.getStatus() == VisitSchedule.VisitStatus.CANCELLED) {
            throw new RuntimeException("Cannot reschedule completed or cancelled visit!");
        }

        // Validate new date is not in past
        if (newDate.isBefore(LocalDate.now())) {
            throw new RuntimeException("Cannot reschedule to a past date!");
        }

        // Store original date/time
        visit.setOriginalDate(visit.getVisitDate());
        visit.setOriginalTime(visit.getVisitTime());

        visit.setVisitDate(newDate);
        visit.setVisitTime(newTime);
        visit.setRescheduleReason(reason);
        visit.setStatus(VisitSchedule.VisitStatus.RESCHEDULED);
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Cancel visit
     */
    public VisitSchedule cancelVisit(String visitId, String userId, String reason) {
        VisitSchedule visit = visitScheduleRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found!"));

        String cancelledBy;
        if (visit.getSeekerId().equals(userId)) {
            cancelledBy = "SEEKER";
        } else if (visit.getOwnerId().equals(userId)) {
            cancelledBy = "OWNER";
        } else {
            throw new RuntimeException("You are not authorized to cancel this visit!");
        }

        if (visit.getStatus() == VisitSchedule.VisitStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel a completed visit!");
        }

        visit.setStatus(VisitSchedule.VisitStatus.CANCELLED);
        visit.setCancellationReason(reason);
        visit.setCancelledBy(cancelledBy);
        visit.setCancelledAt(LocalDateTime.now());
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Mark visit as completed
     */
    public VisitSchedule completeVisit(String visitId, String ownerId, String feedback) {
        VisitSchedule visit = getVisitAndVerifyOwner(visitId, ownerId);

        if (visit.getStatus() != VisitSchedule.VisitStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed visits can be marked as completed!");
        }

        visit.setStatus(VisitSchedule.VisitStatus.COMPLETED);
        visit.setVisitFeedback(feedback);
        visit.setCompletedAt(LocalDateTime.now());
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Mark as no-show
     */
    public VisitSchedule markNoShow(String visitId, String ownerId) {
        VisitSchedule visit = getVisitAndVerifyOwner(visitId, ownerId);

        if (visit.getStatus() != VisitSchedule.VisitStatus.CONFIRMED) {
            throw new RuntimeException("Only confirmed visits can be marked as no-show!");
        }

        visit.setStatus(VisitSchedule.VisitStatus.NO_SHOW);
        visit.setUpdatedAt(LocalDateTime.now());

        return visitScheduleRepository.save(visit);
    }

    /**
     * Get visit by ID
     */
    public VisitSchedule getVisitById(String visitId) {
        return visitScheduleRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found!"));
    }

    /**
     * Get all visits for seeker
     */
    public List<VisitSchedule> getSeekerVisits(String seekerId) {
        return visitScheduleRepository.findBySeekerIdOrderByVisitDateDesc(seekerId);
    }

    /**
     * Get all visits for owner
     */
    public List<VisitSchedule> getOwnerVisits(String ownerId) {
        return visitScheduleRepository.findByOwnerIdOrderByVisitDateDesc(ownerId);
    }

    /**
     * Get upcoming visits for owner
     */
    public List<VisitSchedule> getUpcomingOwnerVisits(String ownerId) {
        return visitScheduleRepository.findByOwnerIdAndStatusAndVisitDateGreaterThanEqual(
                ownerId, 
                VisitSchedule.VisitStatus.CONFIRMED, 
                LocalDate.now()
        );
    }

    /**
     * Get upcoming visits for seeker
     */
    public List<VisitSchedule> getUpcomingSeekerVisits(String seekerId) {
        return visitScheduleRepository.findBySeekerIdAndStatusAndVisitDateGreaterThanEqual(
                seekerId, 
                VisitSchedule.VisitStatus.CONFIRMED, 
                LocalDate.now()
        );
    }

    /**
     * Get pending visit requests for owner
     */
    public List<VisitSchedule> getPendingVisitRequests(String ownerId) {
        return visitScheduleRepository.findByOwnerIdAndStatus(ownerId, VisitSchedule.VisitStatus.PENDING);
    }

    /**
     * Get visits for a specific date (Owner)
     */
    public List<VisitSchedule> getOwnerVisitsByDate(String ownerId, LocalDate date) {
        return visitScheduleRepository.findByOwnerIdAndVisitDate(ownerId, date);
    }

    /**
     * Get today's visit count for owner
     */
    public long getTodayVisitCount(String ownerId) {
        return visitScheduleRepository.countByOwnerIdAndVisitDate(ownerId, LocalDate.now());
    }

    // Helper method
    private VisitSchedule getVisitAndVerifyOwner(String visitId, String ownerId) {
        VisitSchedule visit = visitScheduleRepository.findById(visitId)
                .orElseThrow(() -> new RuntimeException("Visit not found!"));

        if (!visit.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("You are not authorized to perform this action!");
        }
        return visit;
    }
}
