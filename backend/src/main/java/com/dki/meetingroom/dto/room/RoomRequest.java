package com.dki.meetingroom.dto.room;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import io.swagger.v3.oas.annotations.media.Schema;

public record RoomRequest(
        @NotBlank @Size(max = 120) @Schema(description = "Unique room name", example = "Orchid") String name,
        @Min(1) @Schema(description = "Number of seats", example = "6", minimum = "1") int capacity,
        @NotBlank @Size(max = 160) @Schema(description = "Building or floor", example = "Floor 1") String location,
        @NotNull @Schema(description = "Whether the room is bookable", example = "true") Boolean active) {
}
