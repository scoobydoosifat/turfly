package com.turfly.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MailService {
    private final JavaMailSender mailSender;

    @Value("${app.mail.enabled:false}") private boolean enabled;
    @Value("${spring.mail.username:}") private String from;
    @Value("${app.frontend-url}") private String frontendUrl;
    @Value("${app.mail.provider:auto}") private String provider;
    @Value("${app.brevo.api-key:}") private String brevoApiKey;
    @Value("${app.brevo.sender-email:}") private String brevoSenderEmail;
    @Value("${app.brevo.sender-name:Turfly}") private String brevoSenderName;

    public void sendPasswordReset(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        if (!enabled && brevoApiKey.isBlank()) {
            log.info("Turfly development password reset for {}: {}", email, resetLink);
            return;
        }

        boolean useBrevo = "brevo".equalsIgnoreCase(provider)
            || ("auto".equalsIgnoreCase(provider) && !brevoApiKey.isBlank());
        if (useBrevo) {
            sendWithBrevo(email, resetLink);
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

    private void sendWithBrevo(String email, String resetLink) {
        if (brevoApiKey.isBlank()) {
            throw new IllegalStateException("Brevo email is not configured. Set BREVO_API_KEY on the backend.");
        }
        if (brevoSenderEmail.isBlank()) {
            throw new IllegalStateException("Brevo email is not configured. Set BREVO_SENDER_EMAIL on the backend.");
        }

        String html = "<div style=\"font-family:Arial,sans-serif;line-height:1.6\">"
            + "<h2>Reset your Turfly password</h2>"
            + "<p>We received a request to reset your Turfly password.</p>"
            + "<p><a href=\"" + resetLink + "\" style=\"background:#cfff46;color:#071b13;padding:12px 18px;border-radius:6px;text-decoration:none;font-weight:bold\">Reset password</a></p>"
            + "<p>This link expires in 30 minutes. If you did not request it, you can ignore this email.</p></div>";
        Map<String, Object> body = Map.of(
            "sender", Map.of("name", brevoSenderName, "email", brevoSenderEmail),
            "to", new Object[]{Map.of("email", email)},
            "subject", "Reset your Turfly password",
            "htmlContent", html,
            "textContent", "Reset your Turfly password: " + resetLink
        );

        try {
            RestClient.create("https://api.brevo.com")
                .post()
                .uri("/v3/smtp/email")
                .contentType(MediaType.APPLICATION_JSON)
                .header("api-key", brevoApiKey)
                .body(body)
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            log.error("Brevo password-reset email failed for {}", email, ex);
            throw new IllegalStateException("The password-reset email could not be sent. Please try again shortly.", ex);
        }
    }
}
