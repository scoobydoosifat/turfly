package com.turfly.service;

import com.turfly.dto.*;
import com.turfly.dto.AuthDtos.UserResponse;
import com.turfly.dto.BookingDtos.BookingResponse;
import com.turfly.dto.ContactDtos.ContactResponse;
import com.turfly.dto.PitchDtos.PitchResponse;
import com.turfly.model.*;

public final class DtoMapper {
    private DtoMapper() { }

    public static UserResponse user(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getRole());
    }

    public static PitchResponse pitch(Pitch pitch) {
        return new PitchResponse(pitch.getId(), pitch.getName(), pitch.getSport(), pitch.getDescription(),
            pitch.getLocation(), pitch.getPricePerHour(), pitch.getCapacity(), pitch.getImageUrl(),
            pitch.getFeatures(), pitch.isActive());
    }

    public static BookingResponse booking(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getPitchId(), booking.getPitchName(),
            booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(), booking.getAmount(),
            booking.getStatus(), booking.getPaymentStatus(), booking.getCustomerName(),
            booking.getCustomerEmail(), booking.getCustomerPhone(), booking.getCreatedAt());
    }

    public static ContactResponse contact(ContactMessage message) {
        return new ContactResponse(message.getId(), message.getName(), message.getEmail(), message.getPhone(),
            message.getSubject(), message.getMessage(), message.isResolved(), message.getCreatedAt());
    }
}
