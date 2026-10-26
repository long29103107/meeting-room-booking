package com.dki.meetingroom.room;
import com.dki.meetingroom.booking.BookingRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.OffsetDateTime;
import java.util.List;
@RestController @RequestMapping("/api/rooms")
public class RoomController {
 private final RoomRepository rooms; private final BookingRepository bookings;
 public RoomController(RoomRepository rooms,BookingRepository bookings){this.rooms=rooms;this.bookings=bookings;}
 public record RoomInput(@NotBlank String name,@Min(1) int capacity,@NotBlank String location,boolean active){}
 @GetMapping public List<Room> all(){return rooms.findAll();}
 @PostMapping @ResponseStatus(HttpStatus.CREATED) public Room create(@Valid @RequestBody RoomInput req){return rooms.save(new Room(req.name(),req.capacity(),req.location(),req.active()));}
 @PutMapping("/{id}") public Room update(@PathVariable long id,@Valid @RequestBody RoomInput req){
  Room r=rooms.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Room not found"));
  r.name=req.name();r.capacity=req.capacity();r.location=req.location();r.active=req.active();return rooms.save(r);
 }
 @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void deactivate(@PathVariable long id){
  Room r=rooms.findById(id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Room not found"));r.active=false;rooms.save(r);
 }
 @GetMapping("/available") public List<Room> available(@RequestParam OffsetDateTime start,@RequestParam OffsetDateTime end,@RequestParam(required=false) Integer minCapacity){
  if(!start.isBefore(end)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"start must be before end");
  return rooms.findByActiveTrueOrderByNameAsc().stream().filter(r->minCapacity==null||r.capacity>=minCapacity)
   .filter(r->!bookings.existsOverlap(r.id,start,end)).toList();
 }
}
