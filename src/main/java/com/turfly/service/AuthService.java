package com.turfly.service;

import com.turfly.dto.AuthDtos.*;
import com.turfly.enums.Role;
import com.turfly.exception.*;
import com.turfly.model.User;
import com.turfly.repository.UserRepository;
import com.turfly.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;

    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmailIgnoreCase(email))
            throw new ConflictException("An account already exists for this email");

        User user = User.builder()
            .name(request.name().trim())
            .email(email)
            .phone(request.phone().trim())
            .password(passwordEncoder.encode(request.password()))
            .role(Role.USER)
            .enabled(true)
            .build();
        userRepository.save(user);
        return new AuthResponse(jwtService.generate(user), DtoMapper.user(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException ex) {
            throw new BadRequestException("Invalid email or password");
        }
        User user = userRepository.findByEmailIgnoreCase(email)
            .orElseThrow(() -> new BadRequestException("Invalid email or password"));
        return new AuthResponse(jwtService.generate(user), DtoMapper.user(user));
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmailIgnoreCase(normalize(request.email())).ifPresent(user -> {
            String token = UUID.randomUUID() + "-" + UUID.randomUUID();
            user.setResetTokenHash(hash(token));
            user.setResetTokenExpiresAt(Instant.now().plusSeconds(1800));
            userRepository.save(user);
            mailService.sendPasswordReset(user.getEmail(), token);
        });
        return new MessageResponse("If that email exists, a password reset link has been sent");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        String tokenHash = hash(request.token());
        User user = userRepository.findByResetTokenHash(tokenHash)
            .orElseThrow(() -> new BadRequestException("This password reset link is invalid"));
        if (user.getResetTokenExpiresAt() == null || Instant.now().isAfter(user.getResetTokenExpiresAt()))
            throw new BadRequestException("This password reset link has expired");
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setResetTokenHash(null);
        user.setResetTokenExpiresAt(null);
        userRepository.save(user);
        return new MessageResponse("Password updated successfully");
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }

    private String hash(String value) {
        try {
            byte[] bytes = MessageDigest.getInstance("SHA-256")
                .digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is unavailable", ex);
        }
    }
}
