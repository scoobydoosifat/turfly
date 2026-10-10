package com.turfly.repository;

import com.turfly.enums.Sport;
import com.turfly.model.Pitch;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface PitchRepository extends MongoRepository<Pitch, String> {
    List<Pitch> findByActiveTrueOrderByNameAsc();
    List<Pitch> findByActiveTrueAndSportOrderByNameAsc(Sport sport);
}
