package com.ck.authService.exception;

public class UnauthorizedException extends AuthException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
