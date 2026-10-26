package com.dki.meetingroom.service;

import com.dki.meetingroom.dto.booking.BookingRequest;
import com.dki.meetingroom.dto.booking.BookingResponse;
import com.dki.meetingroom.entity.Booking;
import com.dki.meetingroom.entity.Room;
import com.dki.meetingroom.repository.BookingRepository;
import com.dki.meetingroom.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-10-26T08:00:00Z");

    @Mock
    BookingRepository bookings;

    @Mock
    RoomRepository rooms;

    private BookingService service;

    @BeforeEach
    void setUp() {
        service = new BookingService(bookings, rooms, Clock.fixed(NOW.toInstant(), ZoneOffset.UTC));
    }

    @Test
    void createMapsPersistedBookingToResponse() {
        Room room = new Room("Orchid", 6, "Floor 1", true);
        room.id = 12L;
        OffsetDateTime start = NOW.plusDays(2);
        Booking booking = new Booking();
        booking.id = 45L;
        booking.room = room;
        booking.userEmail = "employee@demo.local";
        booking.title = "Planning";
        booking.startTime = start;
        booking.endTime = start.plusHours(1);
        booking.createdAt = NOW;

        when(rooms.findById(12L)).thenReturn(Optional.of(room));
        when(bookings.saveAndFlush(any(Booking.class))).thenReturn(booking);

        BookingResponse response = service.create(
                new BookingRequest(12L, " Planning ", start, start.plusHours(1)), booking.userEmail);

        assertEquals(45L, response.id());
        assertEquals(12L, response.room().id());
        assertEquals("employee@demo.local", response.userEmail());
        verify(bookings).saveAndFlush(any(Booking.class));
    }

    @Test
    void createRejectsInvalidAndPastWindowsBeforeDatabaseWrites() {
        OffsetDateTime start = NOW.minusHours(1);
        ResponseStatusException invalid = assertThrows(ResponseStatusException.class,
                () -> service.create(new BookingRequest(1L, "Meeting", start, start), "employee"));
        assertEquals(HttpStatus.BAD_REQUEST, invalid.getStatusCode());

        ResponseStatusException past = assertThrows(ResponseStatusException.class,
                () -> service.create(new BookingRequest(1L, "Meeting", start, NOW), "employee"));
        assertEquals(HttpStatus.BAD_REQUEST, past.getStatusCode());
        verify(rooms, never()).findById(any());
        verify(bookings, never()).saveAndFlush(any());
    }

    @Test
    void createRejectsInactiveRoomAndMapsDatabaseOverlapToConflict() {
        OffsetDateTime start = NOW.plusDays(1);
        Room inactive = new Room("Inactive", 4, "Floor 2", false);
        when(rooms.findById(1L)).thenReturn(Optional.of(inactive));

        ResponseStatusException inactiveError = assertThrows(ResponseStatusException.class,
                () -> service.create(new BookingRequest(1L, "Meeting", start, start.plusHours(1)), "employee"));
        assertEquals(HttpStatus.BAD_REQUEST, inactiveError.getStatusCode());
        verify(bookings, never()).saveAndFlush(any());

        Room active = new Room("Active", 4, "Floor 2", true);
        when(rooms.findById(2L)).thenReturn(Optional.of(active));
        when(bookings.saveAndFlush(any(Booking.class)))
                .thenThrow(new DataIntegrityViolationException("simulated PostgreSQL exclusion violation"));
        ResponseStatusException conflict = assertThrows(ResponseStatusException.class,
                () -> service.create(new BookingRequest(2L, "Meeting", start, start.plusHours(1)), "employee"));
        assertEquals(HttpStatus.CONFLICT, conflict.getStatusCode());
        verify(bookings).saveAndFlush(any(Booking.class));
    }

    @Test
    void employeeMayCancelOwnFutureBookingButNotAnotherOwners() {
        Booking booking = futureBooking("owner@demo.local");
        when(bookings.findById(45L)).thenReturn(Optional.of(booking));
        when(bookings.save(booking)).thenReturn(booking);

        ResponseStatusException forbidden = assertThrows(ResponseStatusException.class,
                () -> service.cancel(45L, "other@demo.local", false));
        assertEquals(HttpStatus.FORBIDDEN, forbidden.getStatusCode());

        BookingResponse response = service.cancel(45L, "owner@demo.local", false);
        assertEquals("CANCELLED", response.status());
        verify(bookings).save(booking);
    }

    @Test
    void employeeCannotCancelPastBookingButAdminCan() {
        Booking booking = futureBooking("owner@demo.local");
        booking.startTime = NOW.minusDays(1);
        when(bookings.findById(45L)).thenReturn(Optional.of(booking));
        when(bookings.save(booking)).thenReturn(booking);

        ResponseStatusException rejected = assertThrows(ResponseStatusException.class,
                () -> service.cancel(45L, "owner@demo.local", false));
        assertEquals(HttpStatus.CONFLICT, rejected.getStatusCode());

        BookingResponse response = service.cancel(45L, "admin@demo.local", true);
        assertEquals("CANCELLED", response.status());
        verify(bookings).save(booking);
    }

    private Booking futureBooking(String owner) {
        Room room = new Room("Orchid", 6, "Floor 1", true);
        room.id = 12L;
        Booking booking = new Booking();
        booking.id = 45L;
        booking.room = room;
        booking.userEmail = owner;
        booking.title = "Planning";
        booking.startTime = NOW.plusDays(1);
        booking.endTime = NOW.plusDays(1).plusHours(1);
        booking.status = "CONFIRMED";
        booking.createdAt = NOW;
        return booking;
    }
}
