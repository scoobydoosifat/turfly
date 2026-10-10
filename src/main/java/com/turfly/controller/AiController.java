package com.turfly.controller;

import com.turfly.dto.AiDtos.*;
import com.turfly.service.AiAssistantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {
    private final AiAssistantService aiService;

    @PostMapping("/ask")
    public AiResponse ask(@RequestBody @Valid AiRequest request) {
        return aiService.ask(request.question());
    }
}
