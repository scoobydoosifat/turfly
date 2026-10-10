package com.turfly.controller;

import com.turfly.dto.ContactDtos.PublicInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public")
public class PublicController {
    private final PublicInfoResponse info;

    public PublicController(@Value("${app.contact.phone}") String phone,
                            @Value("${app.contact.email}") String email,
                            @Value("${app.contact.address}") String address) {
        this.info = new PublicInfoResponse(phone, email, address);
    }

    @GetMapping("/info")
    public PublicInfoResponse info() {
        return info;
    }
}
