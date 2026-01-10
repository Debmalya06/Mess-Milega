package com.example.Mess_PgSathi.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BookingRequest {
    @NotBlank(message = "Property ID is required")
    private String propertyId;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    private int numberOfMonths = 6; // Default 6 months
}
