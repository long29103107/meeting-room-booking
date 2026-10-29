package com.dki.meetingroom.repository;

import com.dki.meetingroom.common.BookingStatuses;
import com.dki.meetingroom.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.List;
public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("select case when count(b)>0 then true else false end from Booking b "
            + "where b.room.id=:roomId and b.status='" + BookingStatuses.CONFIRMED
            + "' and b.startTime<:end and b.endTime>:start")
    boolean existsOverlap(@Param("roomId") Long roomId,
                          @Param("start") OffsetDateTime start,
                          @Param("end") OffsetDateTime end);

    List<Booking> findByUserEmailOrderByStartTimeDesc(String userEmail);

    List<Booking> findAllByOrderByStartTimeDesc();

    @Query(value = "select b from Booking b join b.room r "
            + "where (:userEmail is null or b.userEmail = :userEmail) "
            + "and (:activeRoomsOnly = false or r.active = true) "
            + "and (:status is null or b.status = :status) "
            + "and (lower(b.title) like :queryPattern "
            + "or lower(r.name) like :queryPattern "
            + "or lower(r.location) like :queryPattern "
            + "or (:includeOwner = true and lower(b.userEmail) like :queryPattern)) ",
            countQuery = "select count(b) from Booking b join b.room r "
                    + "where (:userEmail is null or b.userEmail = :userEmail) "
                    + "and (:activeRoomsOnly = false or r.active = true) "
                    + "and (:status is null or b.status = :status) "
                    + "and (lower(b.title) like :queryPattern "
                    + "or lower(r.name) like :queryPattern "
                    + "or lower(r.location) like :queryPattern "
                    + "or (:includeOwner = true and lower(b.userEmail) like :queryPattern))")
    Page<Booking> searchPage(@Param("userEmail") String userEmail,
                             @Param("activeRoomsOnly") boolean activeRoomsOnly,
                             @Param("includeOwner") boolean includeOwner,
                             @Param("status") String status,
                             @Param("queryPattern") String queryPattern,
                             Pageable pageable);

    @Query("select b from Booking b where b.startTime < :end and b.endTime > :start "
            + "and b.status='" + BookingStatuses.CONFIRMED + "' order by b.startTime")
    List<Booking> calendar(@Param("start") OffsetDateTime start, @Param("end") OffsetDateTime end);
}
