package com.dki.meetingroom.dto.booking;

import com.dki.meetingroom.dto.room.RoomResponse;
import com.dki.meetingroom.entity.Booking;

import java.time.OffsetDateTime;

public record BookingResponse(
        Long id,
        RoomResponse room,
        String userEmail,
        String title,
        OffsetDateTime startTime,
        OffsetDateTime endTime,
        String status,
        OffsetDateTime createdAt) {

    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.id,
                RoomResponse.from(booking.room),
                booking.userEmail,
                booking.title,
                booking.startTime,
                booking.endTime,
                booking.status,
                booking.createdAt);
    }
}
