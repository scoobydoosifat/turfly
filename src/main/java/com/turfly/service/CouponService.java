package com.turfly.service;

import com.turfly.dto.CouponDtos.*;
import com.turfly.enums.DiscountType;
import com.turfly.exception.*;
import com.turfly.model.Coupon;
import com.turfly.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.*;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository repository;
    private final PitchService pitchService;

    public CouponValidationResponse validateForPitch(String code, String pitchId) {
        BigDecimal original = pitchService.entity(pitchId).getPricePerHour()
            .multiply(new BigDecimal("1.5")).setScale(0, RoundingMode.HALF_UP);
        Discount discount = calculate(code, original);
        return new CouponValidationResponse(true, "Coupon applied", discount.code(), original,
            discount.amount(), original.subtract(discount.amount()));
    }

    public Discount calculate(String code, BigDecimal originalAmount) {
        if (code == null || code.isBlank()) return new Discount(null, BigDecimal.ZERO);
        Coupon coupon = repository.findByCodeIgnoreCase(code.trim())
            .orElseThrow(() -> new BadRequestException("Coupon code was not found"));
        if (!coupon.isActive()) throw new BadRequestException("This coupon is inactive");
        if (coupon.getExpiresOn().isBefore(LocalDate.now())) throw new BadRequestException("This coupon has expired");
        if (coupon.getUsedCount() >= coupon.getMaxUses()) throw new BadRequestException("This coupon has reached its usage limit");

        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENTAGE
            ? originalAmount.multiply(coupon.getDiscountValue()).divide(new BigDecimal("100"), 0, RoundingMode.HALF_UP)
            : coupon.getDiscountValue().setScale(0, RoundingMode.HALF_UP);
        if (discount.compareTo(originalAmount) >= 0)
            throw new BadRequestException("Coupon discount must be less than the booking amount");
        return new Discount(coupon.getCode(), discount);
    }

    public synchronized void markUsed(String code) {
        if (code == null || code.isBlank()) return;
        repository.findByCodeIgnoreCase(code).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            repository.save(coupon);
        });
    }

    public List<CouponResponse> list() {
        return repository.findAllByOrderByCreatedAtDesc().stream().map(this::response).toList();
    }

    public CouponResponse create(CouponRequest request) {
        String code = normalize(request.code());
        validateRequest(request);
        if (repository.existsByCodeIgnoreCase(code)) throw new ConflictException("Coupon code already exists");
        Coupon coupon = Coupon.builder().code(code).discountType(request.discountType())
            .discountValue(request.discountValue()).expiresOn(request.expiresOn())
            .maxUses(request.maxUses()).active(request.active() == null || request.active()).build();
        return response(repository.save(coupon));
    }

    public CouponResponse update(String id, CouponRequest request) {
        Coupon coupon = entity(id);
        String code = normalize(request.code());
        validateRequest(request);
        repository.findByCodeIgnoreCase(code).filter(found -> !found.getId().equals(id))
            .ifPresent(found -> { throw new ConflictException("Coupon code already exists"); });
        coupon.setCode(code);
        coupon.setDiscountType(request.discountType());
        coupon.setDiscountValue(request.discountValue());
        coupon.setExpiresOn(request.expiresOn());
        coupon.setMaxUses(request.maxUses());
        if (request.active() != null) coupon.setActive(request.active());
        return response(repository.save(coupon));
    }

    public void delete(String id) { repository.delete(entity(id)); }

    private Coupon entity(String id) {
        return repository.findById(id).orElseThrow(() -> new NotFoundException("Coupon not found"));
    }

    private void validateRequest(CouponRequest request) {
        if (request.discountType() == DiscountType.PERCENTAGE && request.discountValue().compareTo(new BigDecimal("100")) > 0)
            throw new BadRequestException("Percentage discount cannot exceed 100");
    }

    private CouponResponse response(Coupon coupon) {
        return new CouponResponse(coupon.getId(), coupon.getCode(), coupon.getDiscountType(),
            coupon.getDiscountValue(), coupon.getExpiresOn(), coupon.getMaxUses(), coupon.getUsedCount(), coupon.isActive());
    }

    private String normalize(String code) { return code.trim().toUpperCase(); }

    public record Discount(String code, BigDecimal amount) { }
}
