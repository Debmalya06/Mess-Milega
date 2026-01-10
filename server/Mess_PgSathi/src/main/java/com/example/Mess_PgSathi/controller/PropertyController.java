package com.example.Mess_PgSathi.controller;

import com.example.Mess_PgSathi.model.Property;
import com.example.Mess_PgSathi.payload.request.AddPropertyRequest;
import com.example.Mess_PgSathi.payload.response.MessageResponse;
import com.example.Mess_PgSathi.payload.response.PropertyResponse;
import com.example.Mess_PgSathi.service.PropertyService;
import com.example.Mess_PgSathi.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    /**
     * Add new property (Only PG_OWNER can access)
     */
    @PostMapping("/add")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> addProperty(@Valid @RequestBody AddPropertyRequest request, 
                                       Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            PropertyResponse propertyResponse = propertyService.addProperty(request, ownerId);
            return ResponseEntity.ok(propertyResponse);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get all properties by owner
     */
    @GetMapping("/my-properties")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getMyProperties(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            List<PropertyResponse> properties = propertyService.getPropertiesByOwner(ownerId);
            return ResponseEntity.ok(properties);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get active properties by owner
     */
    @GetMapping("/my-active-properties")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getMyActiveProperties(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            List<PropertyResponse> properties = propertyService.getActivePropertiesByOwner(ownerId);
            return ResponseEntity.ok(properties);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get property by ID
     */
    @GetMapping("/{propertyId}")
    public ResponseEntity<?> getPropertyById(@PathVariable String propertyId) {
        try {
            PropertyResponse property = propertyService.getPropertyById(propertyId);
            return ResponseEntity.ok(property);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Update property (Only property owner can update)
     */
    @PutMapping("/{propertyId}")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> updateProperty(@PathVariable String propertyId,
                                          @Valid @RequestBody AddPropertyRequest request,
                                          Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            PropertyResponse updatedProperty = propertyService.updateProperty(propertyId, request, ownerId);
            return ResponseEntity.ok(updatedProperty);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Delete property (Only property owner can delete)
     */
    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> deleteProperty(@PathVariable String propertyId,
                                          Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            propertyService.deleteProperty(propertyId, ownerId);
            return ResponseEntity.ok(new MessageResponse("Property deleted successfully!"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get property statistics for owner dashboard
     */
    @GetMapping("/my-statistics")
    @PreAuthorize("hasRole('PG_OWNER')")
    public ResponseEntity<?> getMyPropertyStatistics(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            String ownerId = userDetails.getId();

            PropertyService.PropertyStatistics stats = propertyService.getOwnerPropertyStatistics(ownerId);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }

    /**
     * Get all active properties (Public endpoint for search)
     */
    @GetMapping("/public/search")
    public ResponseEntity<?> searchProperties(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String propertyType,
            @RequestParam(required = false) String roomType,
            @RequestParam(required = false) String genderPreference,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        try {
            // Convert string parameters to enum types
            Property.PropertyType propType = propertyType != null ? Property.PropertyType.valueOf(propertyType.toUpperCase()) : null;
            Property.RoomType rmType = roomType != null ? Property.RoomType.valueOf(roomType.toUpperCase()) : null;
            Property.GenderPreference genderPref = genderPreference != null ? Property.GenderPreference.valueOf(genderPreference.toUpperCase()) : null;
            
            List<Property> properties = propertyService.searchProperties(
                city, null, propType, rmType, minPrice, maxPrice, genderPref
            );
            return ResponseEntity.ok(properties);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: " + e.getMessage()));
        }
    }
}
