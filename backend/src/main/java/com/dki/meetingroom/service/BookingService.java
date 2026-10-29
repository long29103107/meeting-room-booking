package com.dki.meetingroom.service;

import com.dki.meetingroom.dto.booking.BookingRequest;
import com.dki.meetingroom.dto.booking.BookingResponse;
import com.dki.meetingroom.dto.booking.PageResponse;
import com.dki.meetingroom.dto.room.RoomResponse;
import com.dki.meetingroom.common.BookingStatuses;
import com.dki.meetingroom.entity.Booking;
import com.dki.meetingroom.entity.Room;
import com.dki.meetingroom.repository.BookingRepository;
import com.dki.meetingroom.repository.RoomRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;

@Service
public class BookingService {
    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<String> BOOKING_STATUSES = Set.of(
            BookingStatuses.CONFIRMED, BookingStatuses.CANCELLED);

    private final BookingRepository bookings;
    private final RoomRepository rooms;
    private final Clock clock;

    public BookingService(BookingRepository bookings, RoomRepository rooms, Clock clock) {
        this.bookings = bookings;
        this.rooms = rooms;
        this.clock = clock;
    }

    @Transactional
    public BookingResponse create(BookingRequest request, String userEmail) {
        validateWindow(request.startTime(), request.endTime());
        if (!request.startTime().isAfter(OffsetDateTime.now(clock))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start must be in the future");
        }

        Room room = rooms.findById(request.roomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        if (!room.active) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Room inactive");
        }

        Booking booking = new Booking();
        booking.room = room;
        booking.userEmail = userEmail;
        booking.title = request.title().trim();
        booking.startTime = request.startTime();
        booking.endTime = request.endTime();
        booking.createdAt = OffsetDateTime.now(clock);
        try {
            return BookingResponse.from(bookings.saveAndFlush(booking));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "The room is already booked for the requested time range");
        }
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findMine(String userEmail) {
        return bookings.findByUserEmailOrderByStartTimeDesc(userEmail).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookings.findAllByOrderByStartTimeDesc().stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findMinePage(
            String userEmail, int page, int size, String query, String status) {
        return findBookingPage(userEmail, true, page, size, query, status);
    }

    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findAllPage(
            int page, int size, String query, String status) {
        return findBookingPage(null, false, page, size, query, status);
    }

    private PageResponse<BookingResponse> findBookingPage(
            String userEmail, boolean activeRoomsOnly, int page, int size, String query, String status) {
        if (page < 0 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "page must be non-negative and size must be between 1 and " + MAX_PAGE_SIZE);
        }
        if (status != null && !BOOKING_STATUSES.contains(status)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "status must be CONFIRMED or CANCELLED");
        }
        if (query != null && query.length() > 100) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "query must be at most 100 characters");
        }

        String normalizedQuery = query == null || query.isBlank()
                ? "%"
                : "%" + query.trim().toLowerCase(java.util.Locale.ROOT) + "%";
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by(Sort.Order.desc("startTime"), Sort.Order.desc("id")));
        Page<Booking> result = bookings.searchPage(
                userEmail, activeRoomsOnly, userEmail == null, status, normalizedQuery, pageable);
        return new PageResponse<>(
                result.getContent().stream().map(BookingResponse::from).toList(),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> findCalendar(OffsetDateTime start, OffsetDateTime end) {
        validateWindow(start, end);
        return bookings.calendar(start, end).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional
    public BookingResponse cancel(long id, String userEmail, boolean admin) {
        Booking booking = bookings.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!admin && !booking.userEmail.equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the owner or an admin can cancel");
        }
        if (!admin && !booking.startTime.isAfter(OffsetDateTime.now(clock))) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only future bookings can be cancelled");
        }
        if (!BookingStatuses.CONFIRMED.equals(booking.status)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Booking is already cancelled");
        }
        booking.status = BookingStatuses.CANCELLED;
        return BookingResponse.from(bookings.save(booking));
    }

    private void validateWindow(OffsetDateTime start, OffsetDateTime end) {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start must be before end");
        }
    }
}
