package com.dki.meetingroom.service;

import com.dki.meetingroom.dto.room.RoomRequest;
import com.dki.meetingroom.dto.room.RoomResponse;
import com.dki.meetingroom.entity.Room;
import com.dki.meetingroom.repository.BookingRepository;
import com.dki.meetingroom.repository.RoomRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class RoomService {
    private final RoomRepository rooms;
    private final BookingRepository bookings;

    public RoomService(RoomRepository rooms, BookingRepository bookings) {
        this.rooms = rooms;
        this.bookings = bookings;
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> findAll(boolean includeInactive, boolean admin) {
        List<Room> result = includeInactive && admin
                ? rooms.findAllByOrderByNameAsc()
                : rooms.findByActiveTrueOrderByNameAsc();
        return result.stream().map(RoomResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public RoomResponse findById(long id) {
        Room room = rooms.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        return RoomResponse.from(room);
    }

    @Transactional
    public RoomResponse create(RoomRequest request) {
        Room room = new Room(request.name().trim(), request.capacity(), request.location().trim(), request.active());
        return save(room);
    }

    @Transactional
    public RoomResponse update(long id, RoomRequest request) {
        Room room = rooms.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        room.name = request.name().trim();
        room.capacity = request.capacity();
        room.location = request.location().trim();
        room.active = request.active();
        return save(room);
    }

    @Transactional
    public void deactivate(long id) {
        Room room = rooms.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Room not found"));
        room.active = false;
        rooms.save(room);
    }

    @Transactional(readOnly = true)
    public List<RoomResponse> findAvailable(OffsetDateTime start, OffsetDateTime end, Integer minCapacity) {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "start must be before end");
        }
        if (minCapacity != null && minCapacity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "minCapacity must be positive");
        }
        return rooms.findByActiveTrueOrderByNameAsc().stream()
                .filter(room -> minCapacity == null || room.capacity >= minCapacity)
                .filter(room -> !bookings.existsOverlap(room.id, start, end))
                .map(RoomResponse::from)
                .toList();
    }

    private RoomResponse save(Room room) {
        try {
            return RoomResponse.from(rooms.saveAndFlush(room));
        } catch (DataIntegrityViolationException exception) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A room with that name already exists");
        }
    }
}
