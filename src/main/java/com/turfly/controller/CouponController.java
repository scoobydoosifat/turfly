package com.turfly.controller;

import com.turfly.dto.CouponDtos.CouponValidationResponse;
import com.turfly.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {
    private final CouponService couponService;

    @GetMapping("/validate")
    public CouponValidationResponse validate(@RequestParam String code, @RequestParam String pitchId) {
        return couponService.validateForPitch(code, pitchId);
    }
}
