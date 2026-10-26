package com.dki.meetingroom.config;
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
 @Bean PasswordEncoder encoder(){ return new BCryptPasswordEncoder(); }
 @Bean UserDetailsService users(PasswordEncoder enc){
  return new InMemoryUserDetailsManager(
   User.withUsername("employee@demo.local").password(enc.encode("Employee123!")).roles("USER").build(),
   User.withUsername("admin@demo.local").password(enc.encode("Admin123!")).roles("ADMIN","USER").build());
 }
 @Bean SecurityFilterChain filter(HttpSecurity http) throws Exception {
  return http.csrf(csrf->csrf.disable())
   .sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a
    .requestMatchers("/actuator/health").permitAll()
    .requestMatchers(HttpMethod.POST,"/api/rooms").hasRole("ADMIN")
    .requestMatchers(HttpMethod.PUT,"/api/rooms/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.DELETE,"/api/rooms/**").hasRole("ADMIN")
    .requestMatchers(HttpMethod.GET,"/api/bookings").hasRole("ADMIN")
    .anyRequest().authenticated())
   .httpBasic(Customizer.withDefaults()).build();
 }
}
