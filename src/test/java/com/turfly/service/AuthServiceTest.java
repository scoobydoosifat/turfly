package com.turfly.service;

import com.turfly.dto.AuthDtos.RegisterRequest;
import com.turfly.dto.AuthDtos.RegistrationVerificationRequest;
import com.turfly.exception.BadRequestException;
import com.turfly.model.RegistrationVerification;
import com.turfly.model.User;
import com.turfly.repository.RegistrationVerificationRepository;
import com.turfly.repository.UserRepository;
import com.turfly.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock UserRepository userRepository;
    @Mock RegistrationVerificationRepository verificationRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock AuthenticationManager authenticationManager;
    @Mock JwtService jwtService;
    @Mock MailService mailService;
    @InjectMocks AuthService service;

    private final RegisterRequest registration = new RegisterRequest(
        "Test Player", "PLAYER@EXAMPLE.COM", "01300000000", "password123");

    @Test
    void createsAccountOnlyAfterCorrectOtp() {
        when(passwordEncoder.encode("password123")).thenReturn("password-hash");
        ArgumentCaptor<RegistrationVerification> pending = ArgumentCaptor.forClass(RegistrationVerification.class);
        ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);

        service.requestRegistrationOtp(registration);

        verify(verificationRepository).save(pending.capture());
        verify(mailService).sendRegistrationOtp(eq("player@example.com"), otp.capture());
        assertThat(otp.getValue()).matches("[0-9]{6}");
        verify(userRepository, never()).save(any());

        when(verificationRepository.findById("player@example.com"))
            .thenReturn(Optional.of(pending.getValue()));
        when(jwtService.generate(any(User.class))).thenReturn("jwt-token");

        var response = service.verifyRegistration(
            new RegistrationVerificationRequest("PLAYER@example.com", otp.getValue()));

        ArgumentCaptor<User> created = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(created.capture());
        verify(verificationRepository).deleteById("player@example.com");
        assertThat(created.getValue().getPassword()).isEqualTo("password-hash");
        assertThat(created.getValue().isEnabled()).isTrue();
        assertThat(response.token()).isEqualTo("jwt-token");
    }

    @Test
    void rejectsIncorrectOtpWithoutCreatingAccount() {
        when(passwordEncoder.encode("password123")).thenReturn("password-hash");
        ArgumentCaptor<RegistrationVerification> pending = ArgumentCaptor.forClass(RegistrationVerification.class);
        service.requestRegistrationOtp(registration);
        verify(verificationRepository).save(pending.capture());
        clearInvocations(verificationRepository);
        when(verificationRepository.findById("player@example.com"))
            .thenReturn(Optional.of(pending.getValue()));

        assertThatThrownBy(() -> service.verifyRegistration(
            new RegistrationVerificationRequest("player@example.com", "abcdef")))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("The verification code is incorrect");

        verify(userRepository, never()).save(any());
        verify(verificationRepository).save(argThat(value -> value.getAttempts() == 1));
    }
}
