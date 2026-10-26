package com.dki.meetingroom.entity;

import com.dki.meetingroom.common.BookingStatuses;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_id", nullable = false)
    public Room room;

    @Column(name = "user_email", nullable = false, length = 200)
    public String userEmail;

    @Column(nullable = false, length = 200)
    public String title;

    @Column(name = "start_time", nullable = false)
    public OffsetDateTime startTime;

    @Column(name = "end_time", nullable = false)
    public OffsetDateTime endTime;

    @Column(nullable = false, length = 16)
    public String status = BookingStatuses.CONFIRMED;

    @Column(name = "created_at", nullable = false, updatable = false)
    public OffsetDateTime createdAt;
}
