package com.turfly.repository;

import com.turfly.enums.BookingStatus;
import com.turfly.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.*;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Booking> findAllByOrderByCreatedAtDesc();
    List<Booking> findByPitchIdAndBookingDateAndStatusNot(
        String pitchId, LocalDate bookingDate, BookingStatus status);
    boolean existsByPitchIdAndBookingDateAndStartTimeAndStatusNot(
        String pitchId, LocalDate bookingDate, LocalTime startTime, BookingStatus status);
    Optional<Booking> findByPaymentTransactionId(String paymentTransactionId);
    long countByStatus(BookingStatus status);
}
