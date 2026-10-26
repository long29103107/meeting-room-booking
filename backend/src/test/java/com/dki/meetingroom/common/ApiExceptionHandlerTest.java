package com.dki.meetingroom.common;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class ApiExceptionHandlerTest {
    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    @Test
    void unexpectedExceptionReturnsGenericApiErrorWithoutInternalDetails() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/rooms");
        ResponseEntity<ApiError> response = handler.unexpected(
                new IllegalStateException("database password must not be returned"), request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals(ApiErrorCodes.INTERNAL_ERROR, response.getBody().code());
        assertEquals("An unexpected error occurred", response.getBody().message());
        assertEquals("/api/v1/rooms", response.getBody().path());
        assertFalse(response.getBody().message().contains("database password"));
    }

    @Test
    void invalidParameterUsesBadRequestEnvelope() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/rooms/available");
        ResponseEntity<ApiError> response = handler.invalidParameter(
                new IllegalArgumentException("invalid query value"), request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals(ApiErrorCodes.INVALID_REQUEST, response.getBody().code());
        assertEquals("/api/v1/rooms/available", response.getBody().path());
    }
}
