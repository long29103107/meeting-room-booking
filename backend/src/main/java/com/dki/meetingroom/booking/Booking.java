package com.dki.meetingroom.booking;
import com.dki.meetingroom.room.Room;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
@Entity @Table(name="bookings")
public class Booking {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) public Long id;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="room_id",nullable=false) public Room room;
 @Column(name="user_email",nullable=false) public String userEmail;
 public String title;
 @Column(name="start_time") public OffsetDateTime startTime;
 @Column(name="end_time") public OffsetDateTime endTime;
 public String status="CONFIRMED";
 @Column(name="created_at",insertable=false,updatable=false) public OffsetDateTime createdAt;
}
