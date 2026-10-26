package com.dki.meetingroom.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.OffsetDateTime;

public record BookingRequest(
        @NotNull @Schema(description = "ID of an active room", example = "1") Long roomId,
        @NotBlank @Size(max = 200) @Schema(description = "Meeting title", example = "Team planning") String title,
        @NotNull @Schema(description = "Offset-aware future start time", example = "2027-01-10T09:00:00Z") OffsetDateTime startTime,
        @NotNull @Schema(description = "Offset-aware end time after startTime", example = "2027-01-10T10:00:00Z") OffsetDateTime endTime) {
}
