package com.turfly.controller;

import com.turfly.dto.ContactDtos.*;
import com.turfly.service.ContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {
    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactResponse create(@RequestBody @Valid ContactRequest request) {
        return contactService.create(request);
    }
}
