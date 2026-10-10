package com.turfly.model;

import com.turfly.enums.Sport;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Document("pitches")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Pitch {
    @Id
    private String id;

    private String name;
    private Sport sport;
    private String description;
    private String location;
    private BigDecimal pricePerHour;
    private Integer capacity;
    private String imageUrl;

    @Builder.Default
    private List<String> features = new ArrayList<>();

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
