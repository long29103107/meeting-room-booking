package com.dki.meetingroom.controller;

import com.dki.meetingroom.dto.booking.BookingRequest;
import com.dki.meetingroom.dto.booking.BookingResponse;
import com.dki.meetingroom.dto.booking.PageResponse;
import com.dki.meetingroom.common.ApiPaths;
import com.dki.meetingroom.common.SecurityRoles;
import com.dki.meetingroom.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping(ApiPaths.BOOKINGS)
@Tag(name = "Bookings", description = "Create, inspect, and cancel room bookings")
@SecurityRequirement(name = "basicAuth")
public class BookingController {
    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @Operation(summary = "Create a booking", description = "Creates a future booking. Returns 409 if the room time range is already taken.")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest request, Authentication authentication) {
        return bookingService.create(request, authentication.getName());
    }

    @GetMapping("/me")
    @Operation(summary = "List my bookings")
    public List<BookingResponse> mine(Authentication authentication) {
        return bookingService.findMine(authentication.getName());
    }

    @GetMapping("/me/page")
    @Operation(summary = "List a page of my bookings")
    public PageResponse<BookingResponse> minePage(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status) {
        return bookingService.findMinePage(authentication.getName(), page, size, query, status);
    }

    @GetMapping
    @Operation(summary = "List all bookings (admin only)")
    public List<BookingResponse> all() {
        return bookingService.findAll();
    }

    @GetMapping("/page")
    @Operation(summary = "List a page of company bookings (admin only)")
    public PageResponse<BookingResponse> allPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status) {
        return bookingService.findAllPage(page, size, query, status);
    }

    @GetMapping("/calendar")
    @Operation(summary = "List confirmed bookings overlapping a time range")
    public List<BookingResponse> calendar(
            @RequestParam OffsetDateTime from,
            @RequestParam OffsetDateTime to) {
        return bookingService.findCalendar(from, to);
    }

    @PatchMapping("/{id}/cancel")
    @Operation(summary = "Cancel a booking", description = "The booking owner or an admin may cancel according to server policy.")
    public BookingResponse cancel(@PathVariable long id, Authentication authentication) {
        boolean admin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals(SecurityRoles.ADMIN_AUTHORITY));
        return bookingService.cancel(id, authentication.getName(), admin);
    }
}
