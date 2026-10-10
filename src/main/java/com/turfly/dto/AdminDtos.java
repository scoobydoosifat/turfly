package com.turfly.dto;

public final class AdminDtos {
    private AdminDtos() { }

    public record AdminStatsResponse(
        long users, long pitches, long bookings, long confirmedBookings, long unreadMessages
    ) { }
}
