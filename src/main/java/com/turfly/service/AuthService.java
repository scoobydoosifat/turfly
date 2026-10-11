package com.turfly.service;

import com.turfly.dto.AuthDtos.*;
import com.turfly.enums.Role;
import com.turfly.exception.*;
import com.turfly.model.RegistrationVerification;
import com.turfly.model.User;
import com.turfly.repository.RegistrationVerificationRepository;
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
    private static final SecureRandom OTP_RANDOM = new SecureRandom();
    private static final int OTP_EXPIRY_SECONDS = 600;
    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository userRepository;
    private final RegistrationVerificationRepository verificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;

    public MessageResponse requestRegistrationOtp(RegisterRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmailIgnoreCase(email))
            throw new ConflictException("An account already exists for this email");

        String otp = String.format("%06d", OTP_RANDOM.nextInt(1_000_000));
        RegistrationVerification verification = RegistrationVerification.builder()
            .name(request.name().trim())
            .email(email)
            .phone(request.phone().trim())
            .passwordHash(passwordEncoder.encode(request.password()))
            .otpHash(hash(email + ":" + otp))
            .expiresAt(Instant.now().plusSeconds(OTP_EXPIRY_SECONDS))
            .attempts(0)
            .build();
        verificationRepository.save(verification);
        try {
            mailService.sendRegistrationOtp(email, otp);
        } catch (RuntimeException ex) {
            verificationRepository.deleteById(email);
            throw ex;
        }
        return new MessageResponse("A 6-digit verification code was sent to " + email);
    }

    public AuthResponse verifyRegistration(RegistrationVerificationRequest request) {
        String email = normalize(request.email());
        RegistrationVerification verification = verificationRepository.findById(email)
            .orElseThrow(() -> new BadRequestException("Request a new verification code first"));

        if (verification.getExpiresAt() == null || Instant.now().isAfter(verification.getExpiresAt())) {
            verificationRepository.deleteById(email);
            throw new BadRequestException("The verification code has expired. Request a new code");
        }
        if (!verification.getOtpHash().equals(hash(email + ":" + request.otp()))) {
            verification.setAttempts(verification.getAttempts() + 1);
            if (verification.getAttempts() >= MAX_OTP_ATTEMPTS) {
                verificationRepository.deleteById(email);
                throw new BadRequestException("Too many incorrect attempts. Request a new code");
            }
            verificationRepository.save(verification);
            throw new BadRequestException("The verification code is incorrect");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            verificationRepository.deleteById(email);
            throw new ConflictException("An account already exists for this email");
        }

        User user = User.builder()
            .name(verification.getName())
            .email(email)
            .phone(verification.getPhone())
            .password(verification.getPasswordHash())
            .role(Role.USER)
            .enabled(true)
            .build();
        userRepository.save(user);
        verificationRepository.deleteById(email);
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
