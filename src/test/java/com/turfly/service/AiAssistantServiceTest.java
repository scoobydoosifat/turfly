package com.turfly.service;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;

import static org.assertj.core.api.Assertions.assertThat;

class AiAssistantServiceTest {
    private final AiAssistantService assistant = new AiAssistantService(
        new DefaultListableBeanFactory().getBeanProvider(ChatClient.Builder.class), false);

    @Test
    void givesUsefulFallbackWithoutExternalAiCredentials() {
        var answer = assistant.ask("Where is the turf located?");

        assertThat(answer.aiGenerated()).isFalse();
        assertThat(answer.answer()).contains("Niketon, Dhaka");
    }
}

