package com.turfly.service;

import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingCleanupJob {
    private final BookingService bookingService;

    @Scheduled(fixedDelay = 300000)
    public void releaseExpiredBookings() {
        try {
            bookingService.expirePendingBookings();
        } catch (RuntimeException ignored) {
            // MongoDB may intentionally be unavailable during local frontend-only work.
        }
    }
}
