package com.dki.meetingroom.booking;
import com.dki.meetingroom.room.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;
@RestController @RequestMapping("/api/bookings")
public class BookingController {
 private final BookingRepository bookings;private final RoomRepository rooms;
 public BookingController(BookingRepository bookings,RoomRepository rooms){this.bookings=bookings;this.rooms=rooms;}
 public record BookingInput(@NotNull Long roomId,@NotBlank String title,@NotNull OffsetDateTime startTime,@NotNull OffsetDateTime endTime){}
 @PostMapping @ResponseStatus(HttpStatus.CREATED)
 public Booking create(@Valid @RequestBody BookingInput request,Authentication auth){
  if(!request.startTime().isBefore(request.endTime())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid time range");
  if(!request.startTime().isAfter(OffsetDateTime.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Start must be in the future");
  Room room=rooms.findById(request.roomId()).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Room not found"));
  if(!room.active) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Room inactive");
  Booking b=new Booking();b.room=room;b.userEmail=auth.getName();b.title=request.title();b.startTime=request.startTime();b.endTime=request.endTime();
  try{return bookings.saveAndFlush(b);}catch(DataIntegrityViolationException ex){throw new ResponseStatusException(HttpStatus.CONFLICT,"Room already booked or constraint violated");}
 }
 @GetMapping("/my") public List<Booking> mine(Authentication auth){return bookings.findByUserEmailOrderByStartTimeDesc(auth.getName());}
 @GetMapping public List<Booking> all(){return bookings.findAll();}
 @GetMapping("/calendar") public List<Booking> calendar(@RequestParam OffsetDateTime start,@RequestParam OffsetDateTime end){
  if(!start.isBefore(end)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Invalid time range");return bookings.calendar(start,end);
 }
 @PatchMapping("/{id}/cancel") public Booking cancel(@PathVariable long id,Authentication auth){
  Booking b=bookings.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Booking not found"));
  if(!b.userEmail.equals(auth.getName())&&!auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN")))
   throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Only owner or admin can cancel");
  if(!b.status.equals("CONFIRMED"))throw new ResponseStatusException(HttpStatus.CONFLICT,"Already cancelled");
  b.status="CANCELLED";return bookings.save(b);
 }
}
