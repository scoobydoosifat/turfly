package com.turfly.service;

import com.turfly.dto.AiDtos.AiResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class AiAssistantService {
    private final ObjectProvider<ChatClient.Builder> builderProvider;
    private final boolean enabled;

    public AiAssistantService(ObjectProvider<ChatClient.Builder> builderProvider,
                              @Value("${app.ai.enabled:false}") boolean enabled) {
        this.builderProvider = builderProvider;
        this.enabled = enabled;
    }

    public AiResponse ask(String question) {
        if (!enabled) return new AiResponse(fallback(question), false);
        ChatClient.Builder builder = builderProvider.getIfAvailable();
        if (builder != null) {
            try {
                String answer = builder.build().prompt()
                    .system("You are Turfly's concise booking assistant. Turfly is a sports turf in Niketon, Dhaka. "
                        + "Opening hours are 7:00 AM to 1:00 AM. Help with pitches, booking, preparation, and venue questions. "
                        + "Never invent availability or payment status; direct users to the live booking page for those facts.")
                    .user(question)
                    .call()
                    .content();
                return new AiResponse(answer, true);
            } catch (RuntimeException ignored) {
                // Use the deterministic fallback when the AI provider is unavailable.
            }
        }
        return new AiResponse(fallback(question), false);
    }

    private String fallback(String question) {
        String text = question.toLowerCase();
        if (text.contains("where") || text.contains("address") || text.contains("location"))
            return "Turfly is located in Niketon, Dhaka.";
        if (text.contains("hour") || text.contains("open") || text.contains("time"))
            return "Turfly is open every day from 7:00 AM until 1:00 AM.";
        if (text.contains("phone") || text.contains("contact"))
            return "Call 013089557984 or email sifatmazib625@gmail.com for help.";
        if (text.contains("book") || text.contains("slot"))
            return "Open the Booking page, choose a pitch and date, select an available 90-minute slot, then confirm payment.";
        return "I can help with Turfly's location, opening hours, booking process, pitches, and contact details.";
    }
}
