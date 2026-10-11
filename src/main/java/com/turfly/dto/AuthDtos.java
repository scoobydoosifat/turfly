package com.turfly.dto;

import com.turfly.enums.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
    private AuthDtos() { }

    public record RegisterRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Pattern(regexp = "^[0-9+ -]{8,20}$", message = "Enter a valid phone number") String phone,
        @NotBlank @Size(min = 8, max = 72) String password
    ) { }

    public record RegistrationVerificationRequest(
        @NotBlank @Email @Size(max = 180) String email,
        @NotBlank @Pattern(regexp = "^[0-9]{6}$", message = "Enter the 6-digit verification code") String otp
    ) { }

    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password
    ) { }

    public record ForgotPasswordRequest(@NotBlank @Email String email) { }

    public record ResetPasswordRequest(
        @NotBlank String token,
        @NotBlank @Size(min = 8, max = 72) String newPassword
    ) { }

    public record UserResponse(String id, String name, String email, String phone, Role role) { }

    public record AuthResponse(String token, UserResponse user) { }

    public record MessageResponse(String message) { }
}
