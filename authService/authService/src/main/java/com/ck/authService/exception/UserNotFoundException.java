package com.ck.authService.exception;

public class UserNotFoundException extends AuthException {

    public UserNotFoundException(String message) {
        super(message);
    }
}
