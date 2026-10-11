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
        @NotBlank @Pattern(regexp = "^[0-9+ -]{8,20}$", message = "Enter a valid phone number") String phone,
        @Size(max = 30) String couponCode
    ) { }

    public record CreateManualBookingRequest(
        @NotBlank @Size(max = 100) String customerName,
        @NotBlank @Email @Size(max = 180) String customerEmail,
        @NotBlank @Pattern(regexp = "^[0-9+ -]{8,20}$", message = "Enter a valid phone number") String customerPhone,
        @NotBlank String pitchId,
        @NotNull @FutureOrPresent LocalDate bookingDate,
        @NotNull LocalTime startTime,
        boolean paid
    ) { }

    public record BookingResponse(
        String id, String pitchId, String pitchName, LocalDate bookingDate,
        LocalTime startTime, LocalTime endTime, BigDecimal originalAmount,
        BigDecimal discountAmount, BigDecimal amount, String couponCode,
        BookingStatus status, PaymentStatus paymentStatus,
        String paymentTransactionId, String customerName, String customerEmail,
        String customerPhone, Instant createdAt
    ) { }

    public record SlotResponse(LocalTime startTime, LocalTime endTime, boolean available) { }

    public record AvailabilityResponse(String pitchId, LocalDate date, List<SlotResponse> slots) { }

    public record AvailabilityCalendarResponse(String pitchId, List<AvailabilityResponse> days) { }

    public record CheckoutResponse(String checkoutUrl, boolean demoMode) { }
}
