package com.turfly.dto;

import com.turfly.enums.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.*;
import java.util.List;

public final class BookingDtos {
    private BookingDtos() { }

    public record CreateBookingRequest(
        @NotBlank String pitchId,
        @NotNull @FutureOrPresent LocalDate bookingDate,
        @NotNull LocalTime startTime,
        @NotBlank @Pattern(regexp = "^[0-9+ -]{8,20}$", message = "Enter a valid phone number") String phone
    ) { }

    public record BookingResponse(
        String id, String pitchId, String pitchName, LocalDate bookingDate,
        LocalTime startTime, LocalTime endTime, BigDecimal amount,
        BookingStatus status, PaymentStatus paymentStatus,
        String customerName, String customerEmail, String customerPhone, Instant createdAt
    ) { }

    public record SlotResponse(LocalTime startTime, LocalTime endTime, boolean available) { }

    public record AvailabilityResponse(String pitchId, LocalDate date, List<SlotResponse> slots) { }

    public record CheckoutResponse(String checkoutUrl, boolean demoMode) { }
}
