package com.example.Mess_PgSathi.payload.request;

import lombok.Data;

import java.util.List;

@Data
public class DocumentSubmitRequest {
    private List<DocumentInfo> documents;

    @Data
    public static class DocumentInfo {
        private String documentType; // AADHAR, PAN, PASSPORT, DRIVING_LICENSE, VOTER_ID
        private String documentUrl;
        private String documentNumber;
    }
}
