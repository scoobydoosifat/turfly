package com.turfly.service;

import com.turfly.dto.ReviewDtos.CreateReviewRequest;
import com.turfly.enums.*;
import com.turfly.exception.BadRequestException;
import com.turfly.model.*;
import com.turfly.repository.ReviewRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {
    @Mock ReviewRepository repository;
    @Mock BookingService bookingService;
    @InjectMocks ReviewService service;

    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder().id("user-1").name("Player One").role(Role.USER).build();
    }

    @Test
    void createsReviewAfterConfirmedSessionEnds() {
        Booking booking = Booking.builder().id("booking-1").userId("user-1").pitchId("pitch-1")
            .bookingDate(LocalDate.now(ZoneId.of("Asia/Dhaka")).minusDays(1))
            .startTime(LocalTime.of(19, 0)).endTime(LocalTime.of(20, 30))
            .status(BookingStatus.CONFIRMED).build();
        when(bookingService.entity("booking-1")).thenReturn(booking);
        when(repository.save(any(Review.class))).thenAnswer(invocation -> {
            Review saved = invocation.getArgument(0);
            saved.setId("review-1");
            return saved;
        });

        var result = service.create(new CreateReviewRequest("booking-1", 5, " Excellent pitch "), user);

        assertThat(result.rating()).isEqualTo(5);
        assertThat(result.comment()).isEqualTo("Excellent pitch");
    }

    @Test
    void rejectsReviewBeforeSessionEnds() {
        Booking booking = Booking.builder().id("booking-1").userId("user-1").pitchId("pitch-1")
            .bookingDate(LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1))
            .startTime(LocalTime.of(19, 0)).endTime(LocalTime.of(20, 30))
            .status(BookingStatus.CONFIRMED).build();
        when(bookingService.entity("booking-1")).thenReturn(booking);

        assertThatThrownBy(() -> service.create(new CreateReviewRequest("booking-1", 4, "Good"), user))
            .isInstanceOf(BadRequestException.class).hasMessageContaining("after");
        verify(repository, never()).save(any());
    }
}
