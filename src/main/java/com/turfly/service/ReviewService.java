package com.turfly.service;

import com.turfly.dto.ReviewDtos.*;
import com.turfly.enums.BookingStatus;
import com.turfly.exception.*;
import com.turfly.model.*;
import com.turfly.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.*;
import java.time.*;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private static final ZoneId DHAKA = ZoneId.of("Asia/Dhaka");
    private final ReviewRepository repository;
    private final BookingService bookingService;

    public ReviewResponse create(CreateReviewRequest request, User user) {
        Booking booking = bookingService.entity(request.bookingId());
        if (!Objects.equals(booking.getUserId(), user.getId())) throw new ForbiddenException("You can only review your own booking");
        if (booking.getStatus() != BookingStatus.CONFIRMED || !completed(booking))
            throw new BadRequestException("Reviews are available after the confirmed session is completed");
        if (repository.existsByBookingId(booking.getId())) throw new ConflictException("This booking has already been reviewed");
        Review review = Review.builder().bookingId(booking.getId()).pitchId(booking.getPitchId())
            .userId(user.getId()).userName(user.getName()).rating(request.rating())
            .comment(request.comment().trim()).build();
        return response(repository.save(review));
    }

    public List<ReviewResponse> mine(User user) {
        return repository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream().map(this::response).toList();
    }

    public ReviewSummaryResponse forPitch(String pitchId) {
        List<ReviewResponse> reviews = repository.findByPitchIdOrderByCreatedAtDesc(pitchId).stream()
            .map(this::response).toList();
        BigDecimal average = reviews.isEmpty() ? BigDecimal.ZERO : BigDecimal.valueOf(
            reviews.stream().mapToInt(ReviewResponse::rating).average().orElse(0)).setScale(1, RoundingMode.HALF_UP);
        return new ReviewSummaryResponse(pitchId, average, reviews.size(), reviews);
    }

    public boolean completed(Booking booking) {
        if (booking.getBookingDate() == null || booking.getStartTime() == null || booking.getEndTime() == null) return false;
        ZonedDateTime end = ZonedDateTime.of(booking.getBookingDate(), booking.getEndTime(), DHAKA);
        if (booking.getEndTime().isBefore(booking.getStartTime())) end = end.plusDays(1);
        return end.isBefore(ZonedDateTime.now(DHAKA));
    }

    private ReviewResponse response(Review review) {
        return new ReviewResponse(review.getId(), review.getBookingId(), review.getPitchId(), review.getUserName(),
            review.getRating(), review.getComment(), review.getCreatedAt());
    }
}
