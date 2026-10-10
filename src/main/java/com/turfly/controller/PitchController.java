package com.turfly.controller;

import com.turfly.dto.PitchDtos.PitchResponse;
import com.turfly.enums.Sport;
import com.turfly.service.PitchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pitches")
@RequiredArgsConstructor
public class PitchController {
    private final PitchService pitchService;

    @GetMapping
    public List<PitchResponse> list(@RequestParam(required = false) Sport sport) {
        return pitchService.list(sport);
    }

    @GetMapping("/{id}")
    public PitchResponse get(@PathVariable String id) {
        return pitchService.get(id);
    }
}
