package com.turfly.security;

import com.turfly.model.User;
import com.turfly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailIgnoreCase(email.trim())
            .orElseThrow(() -> new UsernameNotFoundException("Invalid email or password"));
        return org.springframework.security.core.userdetails.User.withUsername(user.getEmail())
            .password(user.getPassword())
            .disabled(!user.isEnabled())
            .authorities("ROLE_" + user.getRole().name())
            .build();
    }
}
