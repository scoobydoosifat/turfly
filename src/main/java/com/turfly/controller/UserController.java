package com.turfly.controller;

import com.turfly.dto.AuthDtos.UserResponse;
import com.turfly.dto.UserDtos.*;
import com.turfly.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final CurrentUser currentUser;

    @PutMapping("/me")
    public UserResponse update(@RequestBody @Valid ProfileUpdateRequest request, Authentication auth) {
        return userService.update(currentUser.from(auth), request);
    }

    @PutMapping("/me/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void password(@RequestBody @Valid PasswordChangeRequest request, Authentication auth) {
        userService.changePassword(currentUser.from(auth), request);
    }
}
