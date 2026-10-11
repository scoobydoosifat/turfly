package com.turfly.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ReviewDtos {
    private ReviewDtos() { }

    public record CreateReviewRequest(
        @NotBlank String bookingId,
        @Min(1) @Max(5) int rating,
        @NotBlank @Size(max = 700) String comment
    ) { }

    public record ReviewResponse(
        String id, String bookingId, String pitchId, String userName,
        int rating, String comment, Instant createdAt
    ) { }

    public record ReviewSummaryResponse(
        String pitchId, BigDecimal averageRating, long reviewCount, List<ReviewResponse> reviews
    ) { }
}
