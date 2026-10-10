package com.turfly.dto;

import jakarta.validation.constraints.*;

import java.time.Instant;

public final class ContactDtos {
    private ContactDtos() { }

    public record ContactRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Size(max = 120) String subject,
        @NotBlank @Size(max = 1500) String message
    ) { }

    public record ContactResponse(
        String id, String name, String email, String phone, String subject,
        String message, boolean resolved, Instant createdAt
    ) { }

    public record PublicInfoResponse(String phone, String email, String address) { }
}
