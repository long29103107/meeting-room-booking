package com.dki.meetingroom.config;

import com.dki.meetingroom.common.ApiError;
import com.dki.meetingroom.common.ApiErrorCodes;
import com.dki.meetingroom.common.ApiPaths;
import com.dki.meetingroom.common.SecurityRoles;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.http.SessionCreationPolicy;
@Configuration
public class SecurityConfig {
    @Bean
    PasswordEncoder encoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    UserDetailsService users(PasswordEncoder encoder) {
        return new InMemoryUserDetailsManager(
                User.withUsername("employee@demo.local")
                        .password(encoder.encode("Employee123!"))
                        .roles(SecurityRoles.EMPLOYEE)
                        .build(),
                User.withUsername("admin@demo.local")
                        .password(encoder.encode("Admin123!"))
                        .roles(SecurityRoles.ADMIN, SecurityRoles.EMPLOYEE)
                        .build());
    }

    @Bean
    SecurityFilterChain filter(HttpSecurity http, ObjectMapper objectMapper) throws Exception {
        return http.csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/actuator/health").permitAll()
                        .requestMatchers(ApiPaths.SWAGGER_UI, ApiPaths.SWAGGER_ASSETS,
                                ApiPaths.OPEN_API_DOCS_ROOT, ApiPaths.OPEN_API_DOCS,
                                ApiPaths.OPEN_API_YAML).permitAll()
                        .requestMatchers(HttpMethod.POST, ApiPaths.ROOMS).hasRole(SecurityRoles.ADMIN)
                        .requestMatchers(HttpMethod.PUT, ApiPaths.ROOM_SUBPATHS).hasRole(SecurityRoles.ADMIN)
                        .requestMatchers(HttpMethod.DELETE, ApiPaths.ROOM_SUBPATHS).hasRole(SecurityRoles.ADMIN)
                        .requestMatchers(HttpMethod.GET, ApiPaths.BOOKINGS).hasRole(SecurityRoles.ADMIN)
                        .anyRequest().authenticated())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) -> writeSecurityError(
                                objectMapper, response, request.getRequestURI(),
                                HttpServletResponse.SC_UNAUTHORIZED, ApiErrorCodes.UNAUTHENTICATED,
                                "Authentication is required"))
                        .accessDeniedHandler((request, response, exception) -> writeSecurityError(
                                objectMapper, response, request.getRequestURI(),
                                HttpServletResponse.SC_FORBIDDEN, ApiErrorCodes.FORBIDDEN,
                                "You do not have permission to perform this action")))
                .httpBasic(Customizer.withDefaults())
                .build();
    }

    private void writeSecurityError(
            ObjectMapper objectMapper,
            HttpServletResponse response,
            String path,
            int status,
            String code,
            String message) throws java.io.IOException {
        response.setStatus(status);
        if (status == HttpServletResponse.SC_UNAUTHORIZED) {
            response.setHeader("WWW-Authenticate", "Basic realm=\"meeting-room\"");
        }
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                OffsetDateTime.now(ZoneOffset.UTC), status, code, message, path));
    }
}
