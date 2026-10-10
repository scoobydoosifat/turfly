package com.turfly.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AiDtos {
    private AiDtos() { }

    public record AiRequest(@NotBlank @Size(max = 500) String question) { }
    public record AiResponse(String answer, boolean aiGenerated) { }
}
