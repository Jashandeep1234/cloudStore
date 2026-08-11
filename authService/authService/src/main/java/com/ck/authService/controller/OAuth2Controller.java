package com.ck.authService.controller;

import com.ck.authService.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/oauth2")
@Tag(name = "OAuth2", description = "Google OAuth2 informational endpoints")
public class OAuth2Controller {

    @GetMapping("/success")
    @Operation(summary = "Informational endpoint after a successful Google login")
    public ResponseEntity<ApiResponse<String>> success() {
        return ResponseEntity.ok(ApiResponse.success(
                "Google login successful. The frontend must use the JWT returned in the redirect.",
                "authenticated"));
    }

    @GetMapping("/failure")
    @Operation(summary = "Informational endpoint after a failed Google login")
    public ResponseEntity<ApiResponse<String>> failure(@RequestParam(value = "error", required = false) String error) {
        String message = "Google login failed"
                + (error != null && !error.isBlank() ? ": " + error : "");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(message));
    }
}
