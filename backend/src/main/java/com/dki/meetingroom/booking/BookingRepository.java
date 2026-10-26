package com.dki.meetingroom.booking;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking,Long>{
 @Query("select case when count(b)>0 then true else false end from Booking b where b.room.id=:roomId and b.status='CONFIRMED' and b.startTime<:end and b.endTime>:start")
 boolean existsOverlap(@Param("roomId") Long roomId,@Param("start") OffsetDateTime start,@Param("end") OffsetDateTime end);
 List<Booking> findByUserEmailOrderByStartTimeDesc(String userEmail);
 @Query("select b from Booking b where b.startTime < :end and b.endTime > :start and b.status='CONFIRMED' order by b.startTime")
 List<Booking> calendar(@Param("start") OffsetDateTime start,@Param("end") OffsetDateTime end);
}
