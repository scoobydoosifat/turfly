package com.turfly.model;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("registration_verifications")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class RegistrationVerification {
    @Id
    private String email;
    private String name;
    private String phone;
    private String passwordHash;
    private String otpHash;
    private Instant expiresAt;
    private int attempts;
}
