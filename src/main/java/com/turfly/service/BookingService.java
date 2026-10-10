package com.turfly.service;

import com.turfly.dto.BookingDtos.*;
import com.turfly.enums.*;
import com.turfly.exception.*;
import com.turfly.model.*;
import com.turfly.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;

import java.math.*;
import java.time.*;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final ZoneId DHAKA = ZoneId.of("Asia/Dhaka");
    private static final List<LocalTime> START_TIMES = List.of(
        LocalTime.of(7, 0), LocalTime.of(8, 30), LocalTime.of(10, 0), LocalTime.of(11, 30),
        LocalTime.of(13, 0), LocalTime.of(14, 30), LocalTime.of(16, 0), LocalTime.of(17, 30),
        LocalTime.of(19, 0), LocalTime.of(20, 30), LocalTime.of(22, 0), LocalTime.of(23, 30)
    );

    private final BookingRepository bookingRepository;
    private final PitchService pitchService;

    public AvailabilityResponse availability(String pitchId, LocalDate date) {
        pitchService.entity(pitchId);
        List<SlotResponse> slots = START_TIMES.stream()
            .map(start -> new SlotResponse(start, start.plusMinutes(90), isAvailable(pitchId, date, start)))
            .toList();
        return new AvailabilityResponse(pitchId, date, slots);
    }

    @CacheEvict(value = "adminStats", allEntries = true)
    public synchronized BookingResponse create(CreateBookingRequest request, User user) {
        Pitch pitch = pitchService.entity(request.pitchId());
        if (!pitch.isActive()) throw new BadRequestException("This pitch is not accepting bookings");
        if (!START_TIMES.contains(request.startTime())) throw new BadRequestException("Choose a valid time slot");
        if (!isAvailable(pitch.getId(), request.bookingDate(), request.startTime()))
            throw new ConflictException("That time slot was just booked. Please choose another one");

        BigDecimal amount = pitch.getPricePerHour().multiply(new BigDecimal("1.5"))
            .setScale(0, RoundingMode.HALF_UP);
        boolean adminBooking = user.getRole() == Role.ADMIN;
        Booking booking = Booking.builder()
            .userId(user.getId())
            .customerName(user.getName())
            .customerEmail(user.getEmail())
            .customerPhone(request.phone().trim())
            .pitchId(pitch.getId())
            .pitchName(pitch.getName())
            .bookingDate(request.bookingDate())
            .startTime(request.startTime())
            .endTime(request.startTime().plusMinutes(90))
            .amount(amount)
            .status(adminBooking ? BookingStatus.CONFIRMED : BookingStatus.PENDING_PAYMENT)
            .paymentStatus(PaymentStatus.UNPAID)
            .paymentTransactionId(null)
            .paymentExpiresAt(adminBooking ? null : Instant.now().plusSeconds(1800))
            .build();
        return DtoMapper.booking(bookingRepository.save(booking));
    }

    public List<BookingResponse> mine(User user) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
            .map(DtoMapper::booking).toList();
    }

    public List<BookingResponse> all() {
        return bookingRepository.findAllByOrderByCreatedAtDesc().stream()
            .map(DtoMapper::booking).toList();
    }

    public Booking entity(String id) {
        return bookingRepository.findById(id).orElseThrow(() -> new NotFoundException("Booking not found"));
    }

    public void cancel(String id, User user) {
        Booking booking = entity(id);
        if (!booking.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN)
            throw new ForbiddenException("You cannot cancel this booking");
        if (booking.getPaymentStatus() == PaymentStatus.PAID)
            throw new BadRequestException("Contact support to cancel a paid booking");
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    public void markPaid(Booking booking, String paymentReference) {
        if (booking.getPaymentStatus() == PaymentStatus.PAID) return;
        booking.setPaymentTransactionId(paymentReference);
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setStatus(BookingStatus.AWAITING_APPROVAL);
        booking.setPaymentExpiresAt(null);
        bookingRepository.save(booking);
    }

    public void markSslCommerzPaid(Booking booking, String transactionId, String validationId) {
        if (booking.getPaymentStatus() == PaymentStatus.PAID) return;
        booking.setPaymentTransactionId(transactionId);
        booking.setPaymentValidationId(validationId);
        booking.setPaymentStatus(PaymentStatus.PAID);
        booking.setStatus(BookingStatus.AWAITING_APPROVAL);
        booking.setPaymentExpiresAt(null);
        bookingRepository.save(booking);
    }

    @CacheEvict(value = "adminStats", allEntries = true)
    public BookingResponse confirmByAdmin(String id) {
        Booking booking = entity(id);
        if (booking.getPaymentStatus() != PaymentStatus.PAID)
            throw new BadRequestException("Payment must be completed before confirmation");
        if (booking.getStatus() != BookingStatus.AWAITING_APPROVAL)
            throw new BadRequestException("Only bookings awaiting approval can be confirmed");
        booking.setStatus(BookingStatus.CONFIRMED);
        return DtoMapper.booking(bookingRepository.save(booking));
    }

    @CacheEvict(value = "adminStats", allEntries = true)
    public BookingResponse rejectByAdmin(String id) {
        Booking booking = entity(id);
        if (booking.getPaymentStatus() != PaymentStatus.PAID)
            throw new BadRequestException("Payment must be completed before rejection");
        if (booking.getStatus() != BookingStatus.AWAITING_APPROVAL)
            throw new BadRequestException("Only bookings awaiting approval can be rejected");
        booking.setStatus(BookingStatus.CANCELLED);
        return DtoMapper.booking(bookingRepository.save(booking));
    }

    public void expirePendingBookings() {
        Instant now = Instant.now();
        bookingRepository.findAll().stream()
            .filter(item -> item.getStatus() == BookingStatus.PENDING_PAYMENT)
            .filter(item -> item.getPaymentExpiresAt() != null && now.isAfter(item.getPaymentExpiresAt()))
            .forEach(item -> {
                item.setStatus(BookingStatus.CANCELLED);
                bookingRepository.save(item);
            });
    }

    private boolean isAvailable(String pitchId, LocalDate date, LocalTime start) {
        ZonedDateTime now = ZonedDateTime.now(DHAKA);
        LocalDateTime slotDateTime = LocalDateTime.of(date, start).atZone(DHAKA).toLocalDateTime();
        if (slotDateTime.isBefore(now.toLocalDateTime())) return false;
        return !bookingRepository.existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
            pitchId, date, start, BookingStatus.CANCELLED);
    }
}
