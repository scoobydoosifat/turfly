package com.turfly.repository;

import com.turfly.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface ReviewRepository extends MongoRepository<Review, String> {
    boolean existsByBookingId(String bookingId);
    List<Review> findByPitchIdOrderByCreatedAtDesc(String pitchId);
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
}
