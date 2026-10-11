package com.turfly.repository;

import com.turfly.model.RegistrationVerification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RegistrationVerificationRepository extends MongoRepository<RegistrationVerification, String> {
}
