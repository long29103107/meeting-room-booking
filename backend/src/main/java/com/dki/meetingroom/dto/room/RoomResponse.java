package com.dki.meetingroom.dto.room;

import com.dki.meetingroom.entity.Room;

public record RoomResponse(Long id, String name, int capacity, String location, boolean active) {
    public static RoomResponse from(Room room) {
        return new RoomResponse(room.id, room.name, room.capacity, room.location, room.active);
    }
}
