package com.turfly.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.turfly.dto.BookingDtos.CheckoutResponse;
import com.turfly.enums.*;
import com.turfly.exception.*;
import com.turfly.model.*;
import com.turfly.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.*;
import org.springframework.web.client.RestClient;

import java.math.*;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final ObjectMapper objectMapper;

    @Value("${app.sslcommerz.store-id:}") private String storeId;
    @Value("${app.sslcommerz.store-password:}") private String storePassword;
    @Value("${app.sslcommerz.sandbox:true}") private boolean sandbox;
    @Value("${app.sslcommerz.demo-enabled:true}") private boolean demoEnabled;
    @Value("${app.frontend-url}") private String frontendUrl;
    @Value("${app.backend-url:http://localhost:9091}") private String backendUrl;

    public CheckoutResponse createCheckout(String bookingId, User user) {
        Booking booking = bookingService.entity(bookingId);
        if (!booking.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN)
            throw new ForbiddenException("You cannot pay for this booking");
        if (booking.getStatus() == BookingStatus.CANCELLED)
            throw new BadRequestException("This booking has expired or was cancelled");
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT)
            throw new BadRequestException("This booking does not require payment");
        if (booking.getPaymentStatus() == PaymentStatus.PAID)
            throw new BadRequestException("This booking is already paid");
        if (storeId.isBlank() || storePassword.isBlank()) {
            if (!demoEnabled) throw new BadRequestException("SSLCommerz is not configured yet");
            return new CheckoutResponse(frontendUrl + "/payment/success?bookingId=" + bookingId + "&demo=true", true);
        }

        String transactionId = "TF" + bookingId;
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("store_id", storeId); form.add("store_passwd", storePassword);
        form.add("total_amount", booking.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString());
        form.add("currency", "BDT"); form.add("tran_id", transactionId);
        form.add("success_url", backendUrl + "/api/payments/sslcommerz/success");
        form.add("fail_url", backendUrl + "/api/payments/sslcommerz/fail");
        form.add("cancel_url", backendUrl + "/api/payments/sslcommerz/cancel");
        form.add("ipn_url", backendUrl + "/api/payments/sslcommerz/ipn");
        form.add("product_category", "sports"); form.add("product_name", booking.getPitchName());
        form.add("product_profile", "non-physical-goods"); form.add("shipping_method", "NO");
        form.add("cus_name", booking.getCustomerName()); form.add("cus_email", booking.getCustomerEmail());
        form.add("cus_phone", booking.getCustomerPhone()); form.add("cus_add1", "Niketon, Dhaka");
        form.add("cus_city", "Dhaka"); form.add("cus_country", "Bangladesh"); form.add("value_a", booking.getId());
        try {
            String response = RestClient.create().post().uri(gatewayBase() + "/gwprocess/v4/api.php")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(form).retrieve().body(String.class);
            JsonNode json = objectMapper.readTree(response == null ? "{}" : response);
            String gatewayUrl = json.path("GatewayPageURL").asText();
            if (!"SUCCESS".equalsIgnoreCase(json.path("status").asText()) || gatewayUrl.isBlank())
                throw new BadRequestException("SSLCommerz checkout could not be created");
            booking.setPaymentTransactionId(transactionId);
            bookingRepository.save(booking);
            return new CheckoutResponse(gatewayUrl, false);
        } catch (BadRequestException ex) { throw ex; }
        catch (Exception ex) { throw new BadRequestException("SSLCommerz checkout could not be created"); }
    }

    public void completeDemo(String bookingId, User user) {
        if (!demoEnabled || !storeId.isBlank() || !storePassword.isBlank())
            throw new BadRequestException("Demo payment is disabled");
        Booking booking = bookingService.entity(bookingId);
        if (!booking.getUserId().equals(user.getId()) && user.getRole() != Role.ADMIN)
            throw new ForbiddenException("You cannot pay for this booking");
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT)
            throw new BadRequestException("This booking does not require payment");
        bookingService.markPaid(booking, "demo_" + bookingId);
    }

    public void handleIpn(MultiValueMap<String, String> params) { processPayment(params); }

    public String handleCallback(MultiValueMap<String, String> params, String outcome) {
        boolean paid = "success".equals(outcome) && processPayment(params);
        String id = bookingId(params);
        if ("success".equals(outcome) && id != null && paid)
            return frontendUrl + "/payment/success?bookingId=" + id;
        return frontendUrl + "/dashboard?payment=" + ("success".equals(outcome) ? "pending" : outcome);
    }

    private boolean processPayment(MultiValueMap<String, String> params) {
        if (!"VALID".equalsIgnoreCase(params.getFirst("status"))) return false;
        String transactionId = params.getFirst("tran_id"), validationId = params.getFirst("val_id");
        if (transactionId == null || validationId == null) return false;
        Booking booking = bookingRepository.findByPaymentTransactionId(transactionId).orElse(null);
        if (booking == null) return false;
        if (booking.getPaymentStatus() == PaymentStatus.PAID) return true;
        BigDecimal amount = decimal(params.getFirst("amount"));
        if (amount == null || amount.compareTo(booking.getAmount()) != 0) return false;
        JsonNode validation = validate(validationId);
        String state = validation.path("status").asText();
        if (!("VALID".equalsIgnoreCase(state) || "VALIDATED".equalsIgnoreCase(state))) return false;
        if (!transactionId.equals(validation.path("tran_id").asText())) return false;
        BigDecimal validatedAmount = decimal(validation.path("amount").asText());
        if (validatedAmount == null || validatedAmount.compareTo(booking.getAmount()) != 0) return false;
        bookingService.markSslCommerzPaid(booking, transactionId, validationId);
        return true;
    }

    private JsonNode validate(String validationId) {
        try {
            String response = RestClient.create().get().uri(uri -> uri
                .scheme("https").host(sandbox ? "sandbox.sslcommerz.com" : "securepay.sslcommerz.com")
                .path("/validator/api/validationserverAPI.php").queryParam("val_id", validationId)
                .queryParam("store_id", storeId).queryParam("store_passwd", storePassword)
                .queryParam("format", "json").queryParam("v", "1").build())
                .retrieve().body(String.class);
            return objectMapper.readTree(response == null ? "{}" : response);
        } catch (Exception ex) { return objectMapper.createObjectNode(); }
    }

    private String gatewayBase() { return sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com"; }
    private String bookingId(MultiValueMap<String, String> params) {
        String transactionId = params.getFirst("tran_id");
        return transactionId == null ? null : bookingRepository.findByPaymentTransactionId(transactionId).map(Booking::getId).orElse(null);
    }
    private BigDecimal decimal(String value) {
        try { return value == null ? null : new BigDecimal(value); } catch (NumberFormatException ex) { return null; }
    }
}
