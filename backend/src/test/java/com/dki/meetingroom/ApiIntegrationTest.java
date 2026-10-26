package com.dki.meetingroom;

import com.dki.meetingroom.entity.Room;
import com.dki.meetingroom.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTest {
    private static final String EMPLOYEE = "employee@demo.local";
    private static final String EMPLOYEE_PASSWORD = "Employee123!";
    private static final String ADMIN = "admin@demo.local";
    private static final String ADMIN_PASSWORD = "Admin123!";

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }

    @Autowired
    MockMvc mvc;

    @Autowired
    RoomRepository rooms;

    private Room room;

    @BeforeEach
    void createRoom() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        room = rooms.saveAndFlush(new Room("Test room " + suffix, 6, "Test floor", true));
    }

    @Test
    void apiRequiresAuthenticationAndRestrictsRoomManagementToAdmin() throws Exception {
        mvc.perform(get("/api/v1/rooms"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHENTICATED"))
                .andExpect(jsonPath("$.status").value(401));

        mvc.perform(post("/api/v1/rooms")
                        .with(httpBasic(EMPLOYEE, EMPLOYEE_PASSWORD))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roomJson("Employee room", true)))
                .andExpect(status().isForbidden());

        mvc.perform(post("/api/v1/rooms")
                        .with(httpBasic(ADMIN, ADMIN_PASSWORD))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(roomJson("Admin room " + UUID.randomUUID(), true)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").exists())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void bookingRejectsOverlapsButAllowsAdjacentIntervals() throws Exception {
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(5).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime end = start.plusHours(1);

        mvc.perform(createBooking(start, end))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.room.id").value(room.id))
                .andExpect(jsonPath("$.userEmail").value(EMPLOYEE));

        mvc.perform(createBooking(start.plusMinutes(30), end.plusMinutes(30)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("CONFLICT"))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.not(org.hamcrest.Matchers.containsString("SQL"))));

        mvc.perform(createBooking(end, end.plusHours(1)))
                .andExpect(status().isCreated());
    }

    @Test
    void bookingRejectsInvalidWindowAndInactiveRoom() throws Exception {
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(5);
        mvc.perform(createBooking(start, start))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        room.active = false;
        rooms.saveAndFlush(room);
        mvc.perform(createBooking(start, start.plusHours(1)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void employeeCannotCancelAnotherUsersBookingButAdminCan() throws Exception {
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(6);
        String response = mvc.perform(post("/api/v1/bookings")
                        .with(httpBasic(ADMIN, ADMIN_PASSWORD))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(bookingJson(start, start.plusHours(1))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long bookingId = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(response).get("id").asLong();

        mvc.perform(patch("/api/v1/bookings/{id}/cancel", bookingId)
                        .with(httpBasic(EMPLOYEE, EMPLOYEE_PASSWORD)))
                .andExpect(status().isForbidden());

        mvc.perform(patch("/api/v1/bookings/{id}/cancel", bookingId)
                        .with(httpBasic(ADMIN, ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));
    }

    @Test
    void cancellingBookingFreesItsTimeSlot() throws Exception {
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(7);
        String response = mvc.perform(createBooking(start, start.plusHours(1)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long bookingId = com.fasterxml.jackson.databind.json.JsonMapper.builder().build()
                .readTree(response).get("id").asLong();

        mvc.perform(patch("/api/v1/bookings/{id}/cancel", bookingId)
                        .with(httpBasic(EMPLOYEE, EMPLOYEE_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELLED"));

        mvc.perform(createBooking(start, start.plusHours(1)))
                .andExpect(status().isCreated());
    }

    @Test
    void concurrentOverlappingBookingsHaveExactlyOneWinner() throws Exception {
        OffsetDateTime start = OffsetDateTime.now(ZoneOffset.UTC).plusDays(8);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch startTogether = new CountDownLatch(1);
        ExecutorService executor = Executors.newFixedThreadPool(2);
        Callable<Integer> attempt = () -> {
            ready.countDown();
            if (!startTogether.await(10, TimeUnit.SECONDS)) {
                throw new IllegalStateException("Timed out waiting for concurrent start");
            }
            return mvc.perform(createBooking(start, start.plusHours(1)))
                    .andReturn().getResponse().getStatus();
        };

        try {
            Future<Integer> first = executor.submit(attempt);
            Future<Integer> second = executor.submit(attempt);
            assertTrue(ready.await(10, TimeUnit.SECONDS), "Both booking requests should be ready");
            startTogether.countDown();
            int firstStatus = first.get(20, TimeUnit.SECONDS);
            int secondStatus = second.get(20, TimeUnit.SECONDS);
            assertTrue((firstStatus == 201 && secondStatus == 409)
                            || (firstStatus == 409 && secondStatus == 201),
                    "Expected exactly one booking success and one conflict, received "
                            + firstStatus + " and " + secondStatus);
        } finally {
            startTogether.countDown();
            executor.shutdownNow();
        }
    }

    private org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder createBooking(
            OffsetDateTime start, OffsetDateTime end) {
        return post("/api/v1/bookings")
                .with(httpBasic(EMPLOYEE, EMPLOYEE_PASSWORD))
                .contentType(MediaType.APPLICATION_JSON)
                .content(bookingJson(start, end));
    }

    private String bookingJson(OffsetDateTime start, OffsetDateTime end) {
        return "{\"roomId\":" + room.id
                + ",\"title\":\"Planning\",\"startTime\":\"" + start
                + "\",\"endTime\":\"" + end + "\"}";
    }

    private String roomJson(String name, boolean active) {
        return "{\"name\":\"" + name
                + "\",\"capacity\":6,\"location\":\"Test floor\",\"active\":" + active + "}";
    }
}
