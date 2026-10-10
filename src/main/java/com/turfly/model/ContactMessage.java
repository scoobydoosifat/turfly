package com.turfly.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("contact_messages")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class ContactMessage {
    @Id
    private String id;

    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;

    @Builder.Default
    private boolean resolved = false;

    @CreatedDate
    private Instant createdAt;
}
