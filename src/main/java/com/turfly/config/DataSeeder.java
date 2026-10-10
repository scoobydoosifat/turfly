package com.turfly.config;

import com.turfly.enums.*;
import com.turfly.model.*;
import com.turfly.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements ApplicationRunner {
    private final UserRepository userRepository;
    private final PitchRepository pitchRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.name}") private String adminName;
    @Value("${app.admin.email}") private String adminEmail;
    @Value("${app.admin.password}") private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        try {
            seedAdmin();
            seedPitches();
        } catch (RuntimeException ex) {
            log.warn("MongoDB is not available yet. Turfly will seed its starter data after a database is configured.");
        }
    }

    private void seedAdmin() {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) return;
        userRepository.save(User.builder()
            .name(adminName)
            .email(adminEmail.trim().toLowerCase())
            .phone("013089557984")
            .password(passwordEncoder.encode(adminPassword))
            .role(Role.ADMIN)
            .enabled(true)
            .build());
    }

    private void seedPitches() {
        if (pitchRepository.count() > 0) return;
        pitchRepository.saveAll(List.of(
            pitch("The Canopy", Sport.FOOTBALL, "A fast 5-a-side surface designed for compact, high-energy matches.",
                "2200", 10, "/images/pitch-football.png", List.of("5-a-side", "Floodlights", "Premium turf")),
            pitch("Night Eleven", Sport.FOOTBALL, "A spacious 6-a-side pitch with excellent grip and evening lighting.",
                "2800", 12, "/images/pitch-night.png", List.of("6-a-side", "Floodlights", "Spectator zone")),
            pitch("The Crease", Sport.CRICKET, "A netted short-pitch cricket arena for practice and competitive sessions.",
                "2400", 12, "/images/pitch-cricket.png", List.of("Turf wicket", "Practice nets", "Equipment available"))
        ));
    }

    private Pitch pitch(String name, Sport sport, String description, String price,
                        int capacity, String image, List<String> features) {
        return Pitch.builder().name(name).sport(sport).description(description)
            .location("Niketon, Dhaka").pricePerHour(new BigDecimal(price))
            .capacity(capacity).imageUrl(image).features(features).active(true).build();
    }
}
