package com.turfly.service;

import com.turfly.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageStorageService {
    private static final Map<String, String> EXTENSIONS = Map.of(
        "image/jpeg", ".jpg",
        "image/png", ".png",
        "image/webp", ".webp"
    );

    private final Path pitchDirectory;

    public ImageStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory) {
        this.pitchDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize().resolve("pitches");
    }

    public String savePitchImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Choose a pitch image");
        String extension = EXTENSIONS.get(file.getContentType());
        if (extension == null) throw new BadRequestException("Use a JPG, PNG or WEBP image");

        String filename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(pitchDirectory);
            Files.copy(file.getInputStream(), pitchDirectory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/pitches/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("The pitch image could not be saved");
        }
    }
}
