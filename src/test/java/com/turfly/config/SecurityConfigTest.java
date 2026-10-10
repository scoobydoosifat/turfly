package com.turfly.config;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import static org.assertj.core.api.Assertions.assertThat;

class SecurityConfigTest {
    private static final String FRONTEND = "https://turflyy.vercel.app";
    private static final String GATEWAY = "https://sandbox.sslcommerz.com";

    private final CorsConfigurationSource source = new SecurityConfig(null)
        .corsConfigurationSource(FRONTEND);

    @Test
    void sslCommerzCallbackAcceptsTheHostedGatewayOrigin() {
        CorsConfiguration config = configuration("POST", "/api/payments/sslcommerz/success");

        assertThat(config.checkOrigin(GATEWAY)).isEqualTo(GATEWAY);
        assertThat(config.checkHttpMethod(HttpMethod.POST)).contains(HttpMethod.POST);
    }

    @Test
    void otherApiRoutesRemainRestrictedToTheTurflyFrontend() {
        CorsConfiguration config = configuration("GET", "/api/admin/stats");

        assertThat(config.checkOrigin(GATEWAY)).isNull();
        assertThat(config.checkOrigin(FRONTEND)).isEqualTo(FRONTEND);
    }

    private CorsConfiguration configuration(String method, String path) {
        MockHttpServletRequest request = new MockHttpServletRequest(method, path);
        request.addHeader(HttpHeaders.ORIGIN, GATEWAY);
        return source.getCorsConfiguration(request);
    }
}
