package com.turfly.service;

import com.turfly.dto.AuthDtos.UserResponse;
import com.turfly.dto.UserDtos.*;
import com.turfly.exception.BadRequestException;
import com.turfly.model.User;
import com.turfly.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse update(User user, ProfileUpdateRequest request) {
        user.setName(request.name().trim());
        user.setPhone(request.phone().trim());
        return DtoMapper.user(userRepository.save(user));
    }

    public void changePassword(User user, PasswordChangeRequest request) {
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword()))
            throw new BadRequestException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public void verifyPassword(User user, DeleteAccountRequest request) {
        if (!passwordEncoder.matches(request.password(), user.getPassword()))
            throw new BadRequestException("Password is incorrect");
    }

    public void deleteAccount(User user, DeleteAccountRequest request) {
        verifyPassword(user, request);
        userRepository.delete(user);
    }

    public List<UserResponse> list() {
        return userRepository.findAll().stream().map(DtoMapper::user).toList();
    }
}
