package com.turfly.service;

import com.turfly.dto.UserDtos.DeleteAccountRequest;
import com.turfly.exception.BadRequestException;
import com.turfly.model.User;
import com.turfly.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock UserRepository repository;
    @Mock org.springframework.security.crypto.password.PasswordEncoder encoder;
    @InjectMocks UserService service;

    @Test
    void rejectsAnIncorrectDeletePassword() {
        User user = User.builder().password("hash").build();
        when(encoder.matches("wrong", "hash")).thenReturn(false);

        assertThatThrownBy(() -> service.verifyPassword(user, new DeleteAccountRequest("wrong")))
            .isInstanceOf(BadRequestException.class)
            .hasMessage("Password is incorrect");
        verify(repository, never()).delete(any());
    }

    @Test
    void deletesTheUserAfterPasswordConfirmation() {
        User user = User.builder().id("user-1").password("hash").build();
        when(encoder.matches("correct", "hash")).thenReturn(true);

        service.deleteAccount(user, new DeleteAccountRequest("correct"));

        verify(repository).delete(user);
    }
}
