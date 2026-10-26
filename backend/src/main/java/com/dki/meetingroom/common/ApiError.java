package com.dki.meetingroom.common;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.OffsetDateTime;

@Schema(description = "Standard API error response")
public record ApiError(
        OffsetDateTime timestamp,
        int status,
        String code,
        String message,
        String path) {
}
