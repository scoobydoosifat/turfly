package com.turfly.service;

import com.turfly.dto.BookingDtos.CreateBookingRequest;
import com.turfly.enums.*;
import com.turfly.exception.ConflictException;
import com.turfly.exception.BadRequestException;
import com.turfly.model.*;
import com.turfly.repository.BookingRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock BookingRepository bookingRepository;
    @Mock PitchService pitchService;
    @Mock CouponService couponService;
    @InjectMocks BookingService bookingService;

    private Pitch pitch;
    private User user;

    @BeforeEach
    void setUp() {
        pitch = Pitch.builder().id("pitch-1").name("The Canopy").active(true)
            .pricePerHour(new BigDecimal("1800")).build();
        user = User.builder().id("user-1").name("Sifat").email("sifat@example.com")
            .role(Role.USER).enabled(true).build();
        lenient().when(couponService.calculate(nullable(String.class), any(BigDecimal.class)))
            .thenReturn(new CouponService.Discount(null, BigDecimal.ZERO));
    }

    @Test
    void createsNinetyMinutePendingBookingWithCalculatedAmount() {
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            "pitch-1", tomorrow, LocalTime.of(19, 0), BookingStatus.CANCELLED)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking saved = invocation.getArgument(0);
            saved.setId("booking-1");
            return saved;
        });

        var result = bookingService.create(
            new CreateBookingRequest("pitch-1", tomorrow, LocalTime.of(19, 0), "013089557984", null), user);

        assertThat(result.id()).isEqualTo("booking-1");
        assertThat(result.endTime()).isEqualTo(LocalTime.of(20, 30));
        assertThat(result.amount()).isEqualByComparingTo("2700");
        assertThat(result.status()).isEqualTo(BookingStatus.PENDING_PAYMENT);
        assertThat(result.paymentStatus()).isEqualTo(PaymentStatus.UNPAID);
    }

    @Test
    void adminBookingIsConfirmedImmediatelyWithoutCheckout() {
        user.setRole(Role.ADMIN);
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            "pitch-1", tomorrow, LocalTime.of(19, 0), BookingStatus.CANCELLED)).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking saved = invocation.getArgument(0);
            saved.setId("admin-booking-1");
            return saved;
        });

        var result = bookingService.create(
            new CreateBookingRequest("pitch-1", tomorrow, LocalTime.of(19, 0), "013089557984", null), user);

        assertThat(result.status()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(result.paymentStatus()).isEqualTo(PaymentStatus.UNPAID);
    }

    @Test
    void refusesAnAlreadyReservedSlot() {
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            "pitch-1", tomorrow, LocalTime.of(20, 30), BookingStatus.CANCELLED)).thenReturn(true);

        assertThatThrownBy(() -> bookingService.create(
            new CreateBookingRequest("pitch-1", tomorrow, LocalTime.of(20, 30), "013089557984", null), user))
            .isInstanceOf(ConflictException.class)
            .hasMessageContaining("just booked");
        verify(bookingRepository, never()).save(any());
    }

    @Test
    void returnsAllTwelveDailySlots() {
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            anyString(), any(), any(), any())).thenReturn(false);

        var result = bookingService.availability("pitch-1", tomorrow);

        assertThat(result.slots()).hasSize(12);
        assertThat(result.slots()).allMatch(slot -> slot.available());
        assertThat(result.slots().getFirst().startTime()).isEqualTo(LocalTime.of(7, 0));
        assertThat(result.slots().getLast().endTime()).isEqualTo(LocalTime.of(1, 0));
    }

    @Test
    void returnsSevenDayAvailabilityCalendar() {
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            anyString(), any(), any(), any())).thenReturn(false);

        var result = bookingService.availabilityCalendar("pitch-1", tomorrow, 7);

        assertThat(result.days()).hasSize(7);
        assertThat(result.days().getFirst().date()).isEqualTo(tomorrow);
        assertThat(result.days().getLast().date()).isEqualTo(tomorrow.plusDays(6));
    }

    @Test
    void appliesCouponToNewBooking() {
        LocalDate tomorrow = LocalDate.now(ZoneId.of("Asia/Dhaka")).plusDays(1);
        when(pitchService.entity("pitch-1")).thenReturn(pitch);
        when(bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            "pitch-1", tomorrow, LocalTime.of(19, 0), BookingStatus.CANCELLED)).thenReturn(false);
        when(couponService.calculate("PLAY10", new BigDecimal("2700")))
            .thenReturn(new CouponService.Discount("PLAY10", new BigDecimal("270")));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = bookingService.create(
            new CreateBookingRequest("pitch-1", tomorrow, LocalTime.of(19, 0), "013089557984", "PLAY10"), user);

        assertThat(result.originalAmount()).isEqualByComparingTo("2700");
        assertThat(result.discountAmount()).isEqualByComparingTo("270");
        assertThat(result.amount()).isEqualByComparingTo("2430");
        assertThat(result.couponCode()).isEqualTo("PLAY10");
    }

    @Test
    void paidBookingWaitsForAdminBeforeConfirmation() {
        Booking booking = Booking.builder().id("booking-1").status(BookingStatus.PENDING_PAYMENT)
            .paymentStatus(PaymentStatus.UNPAID).build();
        when(bookingRepository.save(booking)).thenReturn(booking);

        bookingService.markPaid(booking, "payment-reference-1");

        assertThat(booking.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.AWAITING_APPROVAL);
        assertThat(booking.getPaymentTransactionId()).isEqualTo("payment-reference-1");
    }

    @Test
    void adminCanConfirmOnlyAfterPayment() {
        Booking booking = Booking.builder().id("booking-1").status(BookingStatus.AWAITING_APPROVAL)
            .paymentStatus(PaymentStatus.PAID).build();
        when(bookingRepository.findById("booking-1")).thenReturn(java.util.Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        var response = bookingService.confirmByAdmin("booking-1");

        assertThat(response.status()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    void adminCannotConfirmAnUnpaidBooking() {
        Booking booking = Booking.builder().id("booking-1").status(BookingStatus.PENDING_PAYMENT)
            .paymentStatus(PaymentStatus.UNPAID).build();
        when(bookingRepository.findById("booking-1")).thenReturn(java.util.Optional.of(booking));

        assertThatThrownBy(() -> bookingService.confirmByAdmin("booking-1"))
            .isInstanceOf(BadRequestException.class)
            .hasMessageContaining("Payment must be completed");
    }
}
