package com.turfly.controller;

import com.turfly.dto.ReviewDtos.*;
import com.turfly.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    @GetMapping("/pitch/{pitchId}")
    public ReviewSummaryResponse pitchReviews(@PathVariable String pitchId) {
        return reviewService.forPitch(pitchId);
    }

    @GetMapping("/me")
    public List<ReviewResponse> mine(Authentication auth) {
        return reviewService.mine(currentUser.from(auth));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@RequestBody @Valid CreateReviewRequest request, Authentication auth) {
        return reviewService.create(request, currentUser.from(auth));
    }
}
