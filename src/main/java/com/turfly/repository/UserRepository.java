package com.turfly.repository;

import com.turfly.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByResetTokenHash(String resetTokenHash);
    boolean existsByEmailIgnoreCase(String email);
    long countByEnabledTrue();
}
