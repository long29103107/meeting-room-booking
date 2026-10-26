package com.dki.meetingroom.common;
import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.Map;
@RestControllerAdvice
public class ApiExceptionHandler {
 @ExceptionHandler(MethodArgumentNotValidException.class)
 ResponseEntity<Map<String,String>> invalid(MethodArgumentNotValidException e){return ResponseEntity.badRequest().body(Map.of("error","Validation failed"));}
 @ExceptionHandler(DataIntegrityViolationException.class)
 ResponseEntity<Map<String,String>> conflict(DataIntegrityViolationException e){return ResponseEntity.status(409).body(Map.of("error","Database constraint violated"));}
 @ExceptionHandler(ResponseStatusException.class)
 ResponseEntity<Map<String,String>> status(ResponseStatusException e){return ResponseEntity.status(e.getStatusCode()).body(Map.of("error",e.getReason()==null?"Request failed":e.getReason()));}
}
