package com.turfly.controller;

import com.turfly.dto.BookingDtos.*;
import com.turfly.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;
    private final CurrentUser currentUser;

    @GetMapping("/availability")
    public AvailabilityResponse availability(@RequestParam String pitchId, @RequestParam LocalDate date) {
        return bookingService.availability(pitchId, date);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@RequestBody @Valid CreateBookingRequest request, Authentication auth) {
        return bookingService.create(request, currentUser.from(auth));
    }

    @GetMapping("/me")
    public List<BookingResponse> mine(Authentication auth) {
        return bookingService.mine(currentUser.from(auth));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(@PathVariable String id, Authentication auth) {
        bookingService.cancel(id, currentUser.from(auth));
    }
}
