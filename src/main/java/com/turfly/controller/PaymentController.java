package com.turfly.controller;

import com.turfly.dto.AuthDtos.MessageResponse;
import com.turfly.dto.BookingDtos.CheckoutResponse;
import com.turfly.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final CurrentUser currentUser;

    @PostMapping("/checkout/{bookingId}")
    public CheckoutResponse checkout(@PathVariable String bookingId, Authentication auth) {
        return paymentService.createCheckout(bookingId, currentUser.from(auth));
    }

    @PostMapping("/demo-complete/{bookingId}")
    public MessageResponse demoComplete(@PathVariable String bookingId, Authentication auth) {
        paymentService.completeDemo(bookingId, currentUser.from(auth));
        return new MessageResponse("Demo payment completed");
    }

    @PostMapping(value = "/sslcommerz/ipn", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<String> ipn(@RequestParam MultiValueMap<String, String> params) {
        paymentService.handleIpn(params);
        return ResponseEntity.ok("OK");
    }

    @RequestMapping(value = "/sslcommerz/{outcome}", method = {RequestMethod.GET, RequestMethod.POST})
    public RedirectView callback(@PathVariable String outcome,
                                 @RequestParam MultiValueMap<String, String> params) {
        if (!outcome.equals("success") && !outcome.equals("fail") && !outcome.equals("cancel"))
            throw new IllegalArgumentException("Unknown payment outcome");
        return new RedirectView(paymentService.handleCallback(params, outcome));
    }
}
