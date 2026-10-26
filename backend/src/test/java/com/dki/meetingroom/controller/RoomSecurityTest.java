package com.dki.meetingroom.controller;

import com.dki.meetingroom.common.ApiExceptionHandler;
import com.dki.meetingroom.config.SecurityConfig;
import com.dki.meetingroom.dto.room.RoomRequest;
import com.dki.meetingroom.dto.room.RoomResponse;
import com.dki.meetingroom.service.RoomService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RoomController.class)
@Import({SecurityConfig.class, ApiExceptionHandler.class})
class RoomSecurityTest {
    @Autowired
    MockMvc mvc;

    @MockBean
    RoomService roomService;

    @Test
    void unauthenticatedApiRequestReturnsStandardJsonError() throws Exception {
        mvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("$.path").value("/api/v1/rooms"));

        verifyNoInteractions(roomService);
    }

    @Test
    void employeeCannotCreateRoomButAdminCan() throws Exception {
        mvc.perform(post("/api/v1/rooms")
                        .with(httpBasic("employee@demo.local", "Employee123!"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Room 1\",\"capacity\":6,\"location\":\"Floor 1\",\"active\":true}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));

        verifyNoInteractions(roomService);

        when(roomService.create(org.mockito.ArgumentMatchers.any(RoomRequest.class)))
                .thenReturn(new RoomResponse(1L, "Room 1", 6, "Floor 1", true));
        mvc.perform(post("/api/v1/rooms")
                        .with(httpBasic("admin@demo.local", "Admin123!"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Room 1\",\"capacity\":6,\"location\":\"Floor 1\",\"active\":true}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Room 1"));

        verify(roomService).create(org.mockito.ArgumentMatchers.any(RoomRequest.class));
    }

    @Test
    void employeeCannotReadAdminBookingCollection() throws Exception {
        mvc.perform(get("/api/v1/bookings")
                        .with(httpBasic("employee@demo.local", "Employee123!")))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }
}
