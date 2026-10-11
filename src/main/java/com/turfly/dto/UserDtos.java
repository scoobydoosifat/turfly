package com.turfly.dto;

import jakarta.validation.constraints.*;

public final class UserDtos {
    private UserDtos() { }

    public record ProfileUpdateRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Pattern(regexp = "^[0-9+ -]{8,20}$", message = "Enter a valid phone number") String phone
    ) { }

    public record PasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, max = 72) String newPassword
    ) { }

    public record DeleteAccountRequest(
        @NotBlank String password
    ) { }
}
