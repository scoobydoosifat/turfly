package com.turfly.dto;

import com.turfly.enums.Sport;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.List;

public final class PitchDtos {
    private PitchDtos() { }

    public record PitchRequest(
        @NotBlank @Size(max = 100) String name,
        @NotNull Sport sport,
        @NotBlank @Size(max = 1000) String description,
        @NotBlank @Size(max = 180) String location,
        @NotNull @DecimalMin("100") BigDecimal pricePerHour,
        @NotNull @Min(2) @Max(30) Integer capacity,
        @NotBlank String imageUrl,
        List<@NotBlank String> features,
        Boolean active
    ) { }

    public record PitchResponse(
        String id, String name, Sport sport, String description, String location,
        BigDecimal pricePerHour, Integer capacity, String imageUrl,
        List<String> features, boolean active
    ) { }

    public record ImageUploadResponse(String imageUrl) { }
}
