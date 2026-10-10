package com.turfly.model;

import com.turfly.enums.*;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.*;

@Document("bookings")
@CompoundIndex(name = "pitch_slot_lookup", def = "{'pitchId': 1, 'bookingDate': 1, 'startTime': 1}")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Booking {
    @Id
    private String id;

    private String userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String pitchId;
    private String pitchName;
    private LocalDate bookingDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal amount;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String paymentTransactionId;
    private String paymentValidationId;
    private Instant paymentExpiresAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
