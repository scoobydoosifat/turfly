package com.turfly.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document("reviews")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Review {
    @Id
    private String id;

    @Indexed(unique = true)
    private String bookingId;

    private String pitchId;
    private String userId;
    private String userName;
    private int rating;
    private String comment;

    @CreatedDate
    private Instant createdAt;
}
