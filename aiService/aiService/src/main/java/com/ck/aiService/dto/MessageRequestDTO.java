package com.ck.aiService.dto;

import jakarta.validation.constraints.NotBlank;

public class MessageRequestDTO {

    @NotBlank(message = "Message is required")
    private String message;

    private String type = "user";

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
