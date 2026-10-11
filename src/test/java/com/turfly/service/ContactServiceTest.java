package com.turfly.service;

import com.turfly.dto.ContactDtos.MessageUpdateRequest;
import com.turfly.enums.MessageStatus;
import com.turfly.model.ContactMessage;
import com.turfly.repository.ContactMessageRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {
    @Mock ContactMessageRepository repository;
    @InjectMocks ContactService service;

    @Test
    void tracksMessageStatusAndInternalNote() {
        ContactMessage message = ContactMessage.builder().id("message-1").status(MessageStatus.NEW).build();
        when(repository.findById("message-1")).thenReturn(Optional.of(message));
        when(repository.save(message)).thenReturn(message);

        var result = service.update("message-1", new MessageUpdateRequest(MessageStatus.RESOLVED, " Called the customer "));

        assertThat(result.status()).isEqualTo(MessageStatus.RESOLVED);
        assertThat(result.resolved()).isTrue();
        assertThat(result.adminNote()).isEqualTo("Called the customer");
    }
}
