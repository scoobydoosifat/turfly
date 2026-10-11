package com.turfly.service;

import com.turfly.dto.AdminDtos.AdminStatsResponse;
import com.turfly.enums.BookingStatus;
import com.turfly.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {
    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
    private final BookingRepository bookingRepository;
    private final ContactService contactService;

    @Cacheable(value = "adminStats", key = "'summary'")
    public AdminStatsResponse stats() {
        return new AdminStatsResponse(
            userRepository.countByEnabledTrue(),
            pitchRepository.count(),
            bookingRepository.count(),
            bookingRepository.countByStatus(BookingStatus.CONFIRMED),
            contactService.countNew()
        );
    }
}
