package com.ck.aiService.exception;

public class ServiceCommunicationException extends RuntimeException {

    private final String serviceName;

    public ServiceCommunicationException(String message, String serviceName) {
        super(message);
        this.serviceName = serviceName;
    }

    public ServiceCommunicationException(String message, String serviceName, Throwable cause) {
        super(message, cause);
        this.serviceName = serviceName;
    }

    public String getServiceName() {
        return serviceName;
    }
}
