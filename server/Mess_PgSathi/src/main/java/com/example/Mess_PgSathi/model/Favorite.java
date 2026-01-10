package com.example.Mess_PgSathi.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "favorites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Favorite {
    @Id
    private String id;

    // User who saved the property
    private String userId;
    private String userName;

    // Property Information
    private String propertyId;
    private String propertyName;
    private String propertyAddress;
    private String propertyCity;
    private double monthlyRent;
    private String propertyImageUrl; // First image for preview

    // Owner Information
    private String ownerId;
    private String ownerName;

    // Timestamps
    private LocalDateTime savedAt;

    // Notes (user can add personal notes)
    private String personalNote;
}
