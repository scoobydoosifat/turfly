package com.turfly.repository;

import com.turfly.model.Coupon;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.*;

public interface CouponRepository extends MongoRepository<Coupon, String> {
    Optional<Coupon> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<Coupon> findAllByOrderByCreatedAtDesc();
}
