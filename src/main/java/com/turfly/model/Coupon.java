package com.turfly.model;

import com.turfly.enums.DiscountType;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.*;

@Document("coupons")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class Coupon {
    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    private DiscountType discountType;
    private BigDecimal discountValue;
    private LocalDate expiresOn;
    private Integer maxUses;

    @Builder.Default
    private int usedCount = 0;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
