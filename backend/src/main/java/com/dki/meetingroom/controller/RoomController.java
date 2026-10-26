package com.dki.meetingroom.controller;

import com.dki.meetingroom.dto.room.RoomRequest;
import com.dki.meetingroom.dto.room.RoomResponse;
import com.dki.meetingroom.common.ApiPaths;
import com.dki.meetingroom.common.SecurityRoles;
import com.dki.meetingroom.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.ROOMS)
@Tag(name = "Rooms", description = "Browse rooms, check availability, and manage room records")
@SecurityRequirement(name = "basicAuth")
public class RoomController {
    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    @Operation(summary = "List rooms", description = "Employees see active rooms. Admins may include inactive rooms.")
    public List<RoomResponse> all(
            @RequestParam(defaultValue = "false") boolean includeInactive,
            Authentication authentication) {
        return roomService.findAll(includeInactive, isAdmin(authentication));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a room by ID")
    public RoomResponse get(@PathVariable long id) {
        return roomService.findById(id);
    }

    @PostMapping
    @Operation(summary = "Create a room (admin only)")
    @ResponseStatus(HttpStatus.CREATED)
    public RoomResponse create(@Valid @RequestBody RoomRequest request) {
        return roomService.create(request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a room (admin only)")
    public RoomResponse update(@PathVariable long id, @Valid @RequestBody RoomRequest request) {
        return roomService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Deactivate a room (admin only)")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable long id) {
        roomService.deactivate(id);
    }

    @GetMapping("/available")
    @Operation(summary = "Find available rooms", description = "Returns active rooms with no confirmed booking overlap in the requested half-open time interval.")
    public List<RoomResponse> available(
            @RequestParam OffsetDateTime startTime,
            @RequestParam OffsetDateTime endTime,
            @RequestParam(required = false) Integer minCapacity) {
        return roomService.findAvailable(startTime, endTime, minCapacity);
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(SecurityRoles.ADMIN_AUTHORITY));
    }
}
