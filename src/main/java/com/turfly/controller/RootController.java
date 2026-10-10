package com.turfly.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class RootController {
    @GetMapping({
        "/", "/book", "/contact", "/login", "/register",
        "/forgot-password", "/reset-password", "/dashboard",
        "/admin", "/payment/success"
    })
    public String app() {
        return "forward:/index.html";
    }
}
