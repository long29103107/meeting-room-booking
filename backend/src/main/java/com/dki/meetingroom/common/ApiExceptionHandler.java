package com.dki.meetingroom.common;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@RestControllerAdvice
public class ApiExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> invalid(MethodArgumentNotValidException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, ApiErrorCodes.INVALID_REQUEST, "Request validation failed", request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<ApiError> unreadable(HttpMessageNotReadableException exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, ApiErrorCodes.INVALID_REQUEST, "Request body is invalid", request);
    }

    @ExceptionHandler({
            ConstraintViolationException.class,
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    ResponseEntity<ApiError> invalidParameter(Exception exception, HttpServletRequest request) {
        return error(HttpStatus.BAD_REQUEST, ApiErrorCodes.INVALID_REQUEST,
                "A request parameter or path value is invalid", request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(DataIntegrityViolationException exception, HttpServletRequest request) {
        return error(HttpStatus.CONFLICT, ApiErrorCodes.RESOURCE_CONFLICT,
                "The request conflicts with an existing resource or database constraint", request);
    }

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiError> status(ResponseStatusException exception, HttpServletRequest request) {
        HttpStatus status = HttpStatus.valueOf(exception.getStatusCode().value());
        String message = exception.getReason() == null ? "Request failed" : exception.getReason();
        return error(status, codeFor(status), message, request);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<ApiError> methodNotAllowed(
            HttpRequestMethodNotSupportedException exception, HttpServletRequest request) {
        return error(HttpStatus.METHOD_NOT_ALLOWED, ApiErrorCodes.METHOD_NOT_ALLOWED,
                "The HTTP method is not supported for this endpoint", request);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    ResponseEntity<ApiError> unsupportedMediaType(
            HttpMediaTypeNotSupportedException exception, HttpServletRequest request) {
        return error(HttpStatus.UNSUPPORTED_MEDIA_TYPE, ApiErrorCodes.UNSUPPORTED_MEDIA_TYPE,
                "The request content type is not supported", request);
    }

    @ExceptionHandler(HttpMediaTypeNotAcceptableException.class)
    ResponseEntity<ApiError> notAcceptable(
            HttpMediaTypeNotAcceptableException exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_ACCEPTABLE, ApiErrorCodes.NOT_ACCEPTABLE,
                "The requested response format is not available", request);
    }

    @ExceptionHandler({NoHandlerFoundException.class, NoResourceFoundException.class})
    ResponseEntity<ApiError> notFound(Exception exception, HttpServletRequest request) {
        return error(HttpStatus.NOT_FOUND, ApiErrorCodes.NOT_FOUND, "Resource not found", request);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception exception, HttpServletRequest request) {
        log.error("Unhandled exception while handling {} {}", request.getMethod(), request.getRequestURI(), exception);
        return error(HttpStatus.INTERNAL_SERVER_ERROR, ApiErrorCodes.INTERNAL_ERROR,
                "An unexpected error occurred", request);
    }

    private ResponseEntity<ApiError> error(
            HttpStatus status, String code, String message, HttpServletRequest request) {
        ApiError body = new ApiError(
                OffsetDateTime.now(ZoneOffset.UTC),
                status.value(),
                code,
                message,
                request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    private String codeFor(HttpStatus status) {
        return switch (status) {
            case BAD_REQUEST -> ApiErrorCodes.INVALID_REQUEST;
            case UNAUTHORIZED -> ApiErrorCodes.UNAUTHENTICATED;
            case FORBIDDEN -> ApiErrorCodes.FORBIDDEN;
            case NOT_FOUND -> ApiErrorCodes.NOT_FOUND;
            case METHOD_NOT_ALLOWED -> ApiErrorCodes.METHOD_NOT_ALLOWED;
            case NOT_ACCEPTABLE -> ApiErrorCodes.NOT_ACCEPTABLE;
            case CONFLICT -> ApiErrorCodes.CONFLICT;
            case UNSUPPORTED_MEDIA_TYPE -> ApiErrorCodes.UNSUPPORTED_MEDIA_TYPE;
            case INTERNAL_SERVER_ERROR -> ApiErrorCodes.INTERNAL_ERROR;
            default -> ApiErrorCodes.REQUEST_FAILED;
        };
    }
}
