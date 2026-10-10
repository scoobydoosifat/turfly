package com.turfly.service;

import com.turfly.dto.PitchDtos.*;
import com.turfly.enums.Sport;
import com.turfly.exception.NotFoundException;
import com.turfly.model.Pitch;
import com.turfly.repository.PitchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PitchService {
    private final PitchRepository pitchRepository;

    @Cacheable(value = "pitches", key = "#sport == null ? 'all' : #sport.name()")
    public List<PitchResponse> list(Sport sport) {
        List<Pitch> pitches = sport == null
            ? pitchRepository.findByActiveTrueOrderByNameAsc()
            : pitchRepository.findByActiveTrueAndSportOrderByNameAsc(sport);
        return pitches.stream().map(DtoMapper::pitch).toList();
    }

    @Cacheable(value = "pitch", key = "#id")
    public PitchResponse get(String id) {
        return DtoMapper.pitch(entity(id));
    }

    @CacheEvict(value = {"pitches", "pitch"}, allEntries = true)
    public PitchResponse create(PitchRequest request) {
        Pitch pitch = Pitch.builder()
            .name(request.name().trim())
            .sport(request.sport())
            .description(request.description().trim())
            .location(request.location().trim())
            .pricePerHour(request.pricePerHour())
            .capacity(request.capacity())
            .imageUrl(request.imageUrl().trim())
            .features(request.features() == null ? List.of() : request.features())
            .active(request.active() == null || request.active())
            .build();
        return DtoMapper.pitch(pitchRepository.save(pitch));
    }

    @CacheEvict(value = {"pitches", "pitch"}, allEntries = true)
    public PitchResponse update(String id, PitchRequest request) {
        Pitch pitch = entity(id);
        pitch.setName(request.name().trim());
        pitch.setSport(request.sport());
        pitch.setDescription(request.description().trim());
        pitch.setLocation(request.location().trim());
        pitch.setPricePerHour(request.pricePerHour());
        pitch.setCapacity(request.capacity());
        pitch.setImageUrl(request.imageUrl().trim());
        pitch.setFeatures(request.features() == null ? List.of() : request.features());
        if (request.active() != null) pitch.setActive(request.active());
        return DtoMapper.pitch(pitchRepository.save(pitch));
    }

    @CacheEvict(value = {"pitches", "pitch"}, allEntries = true)
    public void delete(String id) {
        pitchRepository.delete(entity(id));
    }

    public Pitch entity(String id) {
        return pitchRepository.findById(id).orElseThrow(() -> new NotFoundException("Pitch not found"));
    }
}
