package com.turfly.service;

import com.turfly.dto.ContactDtos.*;
import com.turfly.exception.NotFoundException;
import com.turfly.model.ContactMessage;
import com.turfly.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ContactService {
    private final ContactMessageRepository repository;

    public ContactResponse create(ContactRequest request) {
        ContactMessage message = ContactMessage.builder()
            .name(request.name().trim())
            .email(request.email().trim().toLowerCase())
            .phone(request.phone().trim())
            .subject(request.subject().trim())
            .message(request.message().trim())
            .build();
        return DtoMapper.contact(repository.save(message));
    }

    public List<ContactResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(DtoMapper::contact).toList();
    }

    public ContactResponse resolve(String id) {
        ContactMessage message = repository.findById(id)
            .orElseThrow(() -> new NotFoundException("Message not found"));
        message.setResolved(true);
        return DtoMapper.contact(repository.save(message));
    }
}
