package com.turfly.service;

import com.turfly.exception.NotFoundException;
import com.turfly.model.User;
import com.turfly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CurrentUser {
    private final UserRepository userRepository;

    public User from(Authentication authentication) {
        if (authentication == null) throw new NotFoundException("User not found");
        return userRepository.findByEmailIgnoreCase(authentication.getName())
            .orElseThrow(() -> new NotFoundException("User not found"));
    }
}
