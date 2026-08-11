package com.ck.authService.exception;

public class DuplicateEmailException extends AuthException {

    public DuplicateEmailException(String message) {
        super(message);
    }
}
