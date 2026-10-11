package com.turfly.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MailServiceTest {
    @Mock JavaMailSender mailSender;
    @InjectMocks MailService service;

    @BeforeEach
    void configureSmtpTestMode() {
        ReflectionTestUtils.setField(service, "enabled", true);
        ReflectionTestUtils.setField(service, "provider", "smtp");
        ReflectionTestUtils.setField(service, "from", "admin@turfly.test");
        ReflectionTestUtils.setField(service, "frontendUrl", "https://turflyy.vercel.app");
        ReflectionTestUtils.setField(service, "brevoApiKey", "");
    }

    @Test
    void registrationEmailContainsOtpAndExpiry() {
        service.sendRegistrationOtp("player@example.com", "123456");

        ArgumentCaptor<SimpleMailMessage> message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(message.capture());
        assertThat(message.getValue().getTo()).containsExactly("player@example.com");
        assertThat(message.getValue().getText()).contains("123456", "10 minutes");
    }

    @Test
    void passwordResetEmailUsesDeployedFrontendUrl() {
        service.sendPasswordReset("player@example.com", "secure-token");

        ArgumentCaptor<SimpleMailMessage> message = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(mailSender).send(message.capture());
        assertThat(message.getValue().getText())
            .contains("https://turflyy.vercel.app/reset-password?token=secure-token", "30 minutes");
    }
}
