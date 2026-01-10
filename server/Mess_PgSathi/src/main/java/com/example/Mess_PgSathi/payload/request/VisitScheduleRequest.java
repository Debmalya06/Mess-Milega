package com.example.Mess_PgSathi.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class VisitScheduleRequest {
    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotNull(message = "Visit date is required")
    private LocalDate visitDate;

    @NotNull(message = "Visit time is required")
    private LocalTime visitTime;

    private String visitPurpose; // First visit, Re-visit, Final inspection
    private String seekerNote;
}
