package com.turfly.controller;

import com.turfly.dto.AdminDtos.AdminStatsResponse;
import com.turfly.dto.AuthDtos.UserResponse;
import com.turfly.dto.BookingDtos.BookingResponse;
import com.turfly.dto.BookingDtos.CreateManualBookingRequest;
import com.turfly.dto.CouponDtos.*;
import com.turfly.dto.ContactDtos.ContactResponse;
import com.turfly.dto.ContactDtos.MessageUpdateRequest;
import com.turfly.dto.PitchDtos.*;
import com.turfly.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;
    private final PitchService pitchService;
    private final BookingService bookingService;
    private final ContactService contactService;
    private final UserService userService;
    private final ImageStorageService imageStorageService;
    private final CouponService couponService;
    private final CurrentUser currentUser;

    @GetMapping("/stats")
    public AdminStatsResponse stats() {
        return adminService.stats();
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings() {
        return bookingService.all();
    }

    @PostMapping("/bookings/manual")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse manualBooking(@RequestBody @Valid CreateManualBookingRequest request, Authentication auth) {
        return bookingService.createManual(request, currentUser.from(auth));
    }

    @PutMapping("/bookings/{id}/confirm")
    public BookingResponse confirmBooking(@PathVariable String id) {
        return bookingService.confirmByAdmin(id);
    }

    @PutMapping("/bookings/{id}/reject")
    public BookingResponse rejectBooking(@PathVariable String id) {
        return bookingService.rejectByAdmin(id);
    }

    @GetMapping("/messages")
    public List<ContactResponse> messages() {
        return contactService.list();
    }

    @PutMapping("/messages/{id}/resolve")
    public ContactResponse resolve(@PathVariable String id) {
        return contactService.resolve(id);
    }

    @PutMapping("/messages/{id}")
    public ContactResponse updateMessage(@PathVariable String id, @RequestBody @Valid MessageUpdateRequest request) {
        return contactService.update(id, request);
    }

    @GetMapping("/coupons")
    public List<CouponResponse> coupons() { return couponService.list(); }

    @PostMapping("/coupons")
    @ResponseStatus(HttpStatus.CREATED)
    public CouponResponse createCoupon(@RequestBody @Valid CouponRequest request) {
        return couponService.create(request);
    }

    @PutMapping("/coupons/{id}")
    public CouponResponse updateCoupon(@PathVariable String id, @RequestBody @Valid CouponRequest request) {
        return couponService.update(id, request);
    }

    @DeleteMapping("/coupons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCoupon(@PathVariable String id) { couponService.delete(id); }

    @GetMapping("/users")
    public List<UserResponse> users() {
        return userService.list();
    }

    @PostMapping("/pitches")
    @ResponseStatus(HttpStatus.CREATED)
    public PitchResponse createPitch(@RequestBody @Valid PitchRequest request) {
        return pitchService.create(request);
    }

    @PostMapping(value = "/pitches/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImageUploadResponse uploadPitchImage(@RequestParam("file") MultipartFile file) {
        return new ImageUploadResponse(imageStorageService.savePitchImage(file));
    }

    @PutMapping("/pitches/{id}")
    public PitchResponse updatePitch(@PathVariable String id, @RequestBody @Valid PitchRequest request) {
        return pitchService.update(id, request);
    }

    @DeleteMapping("/pitches/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePitch(@PathVariable String id) {
        pitchService.delete(id);
    }
}
