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
    private final String backendUrl;

    public ImageStorageService(@Value("${app.upload-dir:uploads}") String uploadDirectory,
                               @Value("${app.backend-url:http://localhost:9091}") String backendUrl) {
        this.pitchDirectory = Paths.get(uploadDirectory).toAbsolutePath().normalize().resolve("pitches");
        this.backendUrl = backendUrl == null ? "" : backendUrl.replaceAll("/$", "");
    }

    public String savePitchImage(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new BadRequestException("Choose a pitch image");
        if (file.getSize() > 8 * 1024 * 1024) throw new BadRequestException("Pitch images must be 8 MB or smaller");
        String contentType = file.getContentType() == null ? "" : file.getContentType().toLowerCase();
        String extension = EXTENSIONS.get(contentType);
        if (extension == null) {
            String filename = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().toLowerCase();
            extension = filename.endsWith(".jpg") || filename.endsWith(".jpeg") ? ".jpg"
                : filename.endsWith(".png") ? ".png"
                : filename.endsWith(".webp") ? ".webp" : null;
        }
        if (extension == null) throw new BadRequestException("Use a JPG, PNG or WEBP image");

        String filename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(pitchDirectory);
            Files.copy(file.getInputStream(), pitchDirectory.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            return backendUrl + "/uploads/pitches/" + filename;
        } catch (IOException ex) {
            throw new BadRequestException("The pitch image could not be saved");
        }
    }
}
