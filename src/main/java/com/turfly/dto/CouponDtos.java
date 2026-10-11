package com.turfly.dto;

import com.turfly.enums.DiscountType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class CouponDtos {
    private CouponDtos() { }

    public record CouponRequest(
        @NotBlank @Size(max = 30) String code,
        @NotNull DiscountType discountType,
        @NotNull @DecimalMin("1") BigDecimal discountValue,
        @NotNull @FutureOrPresent LocalDate expiresOn,
        @NotNull @Min(1) Integer maxUses,
        Boolean active
    ) { }

    public record CouponResponse(
        String id, String code, DiscountType discountType, BigDecimal discountValue,
        LocalDate expiresOn, Integer maxUses, int usedCount, boolean active
    ) { }

    public record CouponValidationResponse(
        boolean valid, String message, String code, BigDecimal originalAmount,
        BigDecimal discountAmount, BigDecimal finalAmount
    ) { }
}
