package com.turfly.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}") private boolean enabled;
    @Value("${spring.mail.username:}") private String from;
    @Value("${app.frontend-url}") private String frontendUrl;

    public void sendPasswordReset(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        if (!enabled) {
            log.info("Turfly development password reset for {}: {}", email, resetLink);
            return;
        }
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) message.setFrom(from);
        message.setTo(email);
        message.setSubject("Reset your Turfly password");
        message.setText("Use this link to reset your Turfly password:\n\n" + resetLink
            + "\n\nThe link expires in 30 minutes. If you did not request it, ignore this email.");
        mailSender.send(message);
    }
}
