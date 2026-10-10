package com.turfly.security;

import com.turfly.enums.Role;
import com.turfly.model.User;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {
    private final JwtService jwtService = new JwtService(
        "a-secure-test-secret-that-is-at-least-thirty-two-bytes-long", 60_000);

    @Test
    void generatesAndValidatesTokenForUser() {
        User user = User.builder().id("u-1").email("player@turfly.test").role(Role.USER).build();
        UserDetails details = org.springframework.security.core.userdetails.User
            .withUsername(user.getEmail()).password("ignored").roles("USER").build();

        String token = jwtService.generate(user);

        assertThat(jwtService.extractEmail(token)).isEqualTo(user.getEmail());
        assertThat(jwtService.isValid(token, details)).isTrue();
        assertThat(jwtService.isValid(token, org.springframework.security.core.userdetails.User
            .withUsername("other@turfly.test").password("ignored").roles("USER").build())).isFalse();
    }
}

