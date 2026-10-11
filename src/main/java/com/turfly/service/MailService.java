package com.turfly.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;
import org.springframework.stereotype.Service;

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

    public void sendRegistrationOtp(String email, String otp) {
        if (!enabled && brevoApiKey.isBlank()) {
            log.info("Turfly development registration code for {}: {}", email, otp);
            return;
        }

        String subject = "Your Turfly verification code";
        String text = "Your Turfly verification code is " + otp
            + ". It expires in 10 minutes. If you did not request it, ignore this email.";
        String html = "<div style=\"font-family:Arial,sans-serif;line-height:1.6\">"
            + "<h2>Verify your Turfly account</h2>"
            + "<p>Enter this code to finish creating your account:</p>"
            + "<p style=\"font-size:30px;font-weight:bold;letter-spacing:8px;color:#234d35\">" + otp + "</p>"
            + "<p>This code expires in 10 minutes. If you did not request it, you can ignore this email.</p></div>";

        if (useBrevo()) {
            sendWithBrevo(email, subject, html, text, "The verification email could not be sent. Please try again shortly.");
            return;
        }

        sendWithSmtp(email, subject, text);
    }

    public void sendPasswordReset(String email, String token) {
        String resetLink = frontendUrl + "/reset-password?token=" + token;
        if (!enabled && brevoApiKey.isBlank()) {
            log.info("Turfly development password reset for {}: {}", email, resetLink);
            return;
        }

        if (useBrevo()) {
            sendPasswordResetWithBrevo(email, resetLink);
            return;
        }

        sendWithSmtp(email, "Reset your Turfly password", "Use this link to reset your Turfly password:\n\n"
            + resetLink + "\n\nThe link expires in 30 minutes. If you did not request it, ignore this email.");
    }

    private boolean useBrevo() {
        return "brevo".equalsIgnoreCase(provider)
            || ("auto".equalsIgnoreCase(provider) && !brevoApiKey.isBlank());
    }

    private void sendWithSmtp(String email, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        if (from != null && !from.isBlank()) message.setFrom(from);
        message.setTo(email);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    private void sendPasswordResetWithBrevo(String email, String resetLink) {
        String subject = "Reset your Turfly password";
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
        sendWithBrevo(email, subject, html, "Reset your Turfly password: " + resetLink,
            "The password-reset email could not be sent. Please try again shortly.");
    }

    private void sendWithBrevo(String email, String subject, String html, String text, String failureMessage) {
        if (brevoApiKey.isBlank()) {
            throw new IllegalStateException("Brevo email is not configured. Set BREVO_API_KEY on the backend.");
        }
        if (brevoSenderEmail.isBlank()) {
            throw new IllegalStateException("Brevo email is not configured. Set BREVO_SENDER_EMAIL on the backend.");
        }
        Map<String, Object> body = Map.of(
            "sender", Map.of("name", brevoSenderName, "email", brevoSenderEmail),
            "to", new Object[]{Map.of("email", email)},
            "subject", subject,
            "htmlContent", html,
            "textContent", text
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
            log.error("Brevo transactional email failed for {}", email, ex);
            throw new IllegalStateException(failureMessage, ex);
        }
    }
}
