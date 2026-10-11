package com.turfly.service;

import com.turfly.dto.CouponDtos.CouponRequest;
import com.turfly.enums.DiscountType;
import com.turfly.exception.BadRequestException;
import com.turfly.model.Coupon;
import com.turfly.repository.CouponRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CouponServiceTest {
    @Mock CouponRepository repository;
    @Mock PitchService pitchService;
    @InjectMocks CouponService service;

    @Test
    void calculatesPercentageDiscount() {
        Coupon coupon = Coupon.builder().code("PLAY10").discountType(DiscountType.PERCENTAGE)
            .discountValue(new BigDecimal("10")).expiresOn(LocalDate.now().plusDays(3))
            .maxUses(20).usedCount(2).active(true).build();
        when(repository.findByCodeIgnoreCase("play10")).thenReturn(Optional.of(coupon));

        var result = service.calculate(" play10 ", new BigDecimal("2700"));

        assertThat(result.code()).isEqualTo("PLAY10");
        assertThat(result.amount()).isEqualByComparingTo("270");
    }

    @Test
    void rejectsExpiredCoupon() {
        Coupon coupon = Coupon.builder().code("OLD").discountType(DiscountType.FIXED)
            .discountValue(new BigDecimal("100")).expiresOn(LocalDate.now().minusDays(1))
            .maxUses(20).active(true).build();
        when(repository.findByCodeIgnoreCase("OLD")).thenReturn(Optional.of(coupon));

        assertThatThrownBy(() -> service.calculate("OLD", new BigDecimal("2700")))
            .isInstanceOf(BadRequestException.class).hasMessageContaining("expired");
    }

    @Test
    void createsNormalizedCoupon() {
        CouponRequest request = new CouponRequest(" weekend ", DiscountType.FIXED,
            new BigDecimal("200"), LocalDate.now().plusDays(7), 10, true);
        when(repository.save(any(Coupon.class))).thenAnswer(invocation -> {
            Coupon saved = invocation.getArgument(0);
            saved.setId("coupon-1");
            return saved;
        });

        var result = service.create(request);

        assertThat(result.code()).isEqualTo("WEEKEND");
        verify(repository).existsByCodeIgnoreCase("WEEKEND");
    }
}
