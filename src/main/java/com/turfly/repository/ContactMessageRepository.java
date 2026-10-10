package com.turfly.repository;

import com.turfly.model.ContactMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ContactMessageRepository extends MongoRepository<ContactMessage, String> {
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
    long countByResolvedFalse();
}
