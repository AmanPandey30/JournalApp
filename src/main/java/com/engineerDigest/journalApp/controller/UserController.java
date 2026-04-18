package com.engineerDigest.journalApp.controller;

import com.engineerDigest.journalApp.api.response.WeatherResponse;
import com.engineerDigest.journalApp.entity.JournalEntry;
import com.engineerDigest.journalApp.entity.User;
import com.engineerDigest.journalApp.repository.UserRepository;
import com.engineerDigest.journalApp.service.EmailService;
import com.engineerDigest.journalApp.service.UserService;
import com.engineerDigest.journalApp.service.WeatherService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/user")
@Slf4j
public class UserController {

    @Autowired private UserService userService;
    @Autowired private UserRepository userRepository;
    @Autowired private WeatherService weatherService;
    @Autowired private EmailService emailService;

    // ── GET profile details ──────────────────────────────────────────────
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByUserName(auth.getName());
        if (user == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        Map<String, Object> profile = new HashMap<>();
        profile.put("userName", user.getUserName());
        profile.put("email", user.getEmail());
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    // ── PUT update user (username / password / email) ───────────────────
    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User userInDb = userService.findByUserName(auth.getName());
        if (userInDb == null) return new ResponseEntity<>(HttpStatus.NOT_FOUND);

        if (user.getUserName() != null && !user.getUserName().isBlank())
            userInDb.setUserName(user.getUserName());

        // Only re-hash if user actually sent a new password
        if (user.getPassWord() != null && !user.getPassWord().isBlank()
                && !user.getPassWord().equals("keep_current_password"))
            userInDb.setPassWord(userService.encodePassword(user.getPassWord()));

        if (user.getEmail() != null)
            userInDb.setEmail(user.getEmail());

        // Use saveUser() — skips BCrypt encoding (password already handled above)
        userService.saveUser(userInDb);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ── DELETE account ───────────────────────────────────────────────────
    @DeleteMapping
    public ResponseEntity<?> deleteByUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        userRepository.deleteByUserName(auth.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    // ── GET greeting ─────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<?> greeting() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return new ResponseEntity<>("Hi " + auth.getName(), HttpStatus.OK);
    }

    // ── GET weather ──────────────────────────────────────────────────────
    @GetMapping("/weather")
    public ResponseEntity<?> getWeather(@RequestParam(defaultValue = "Mumbai") String city) {
        try {
            WeatherResponse wr = weatherService.getWeather(city);
            if (wr == null || wr.getCurrent() == null)
                return new ResponseEntity<>(Map.of("error", "Weather unavailable"), HttpStatus.SERVICE_UNAVAILABLE);

            String cityName = wr.getLocation() != null ? wr.getLocation().getName() : city;
            String desc = (wr.getCurrent().getWeatherDescriptions() != null && !wr.getCurrent().getWeatherDescriptions().isEmpty())
                    ? wr.getCurrent().getWeatherDescriptions().get(0) : "";

            Map<String, String> result = new HashMap<>();
            result.put("city", cityName);
            result.put("temperature", String.valueOf(wr.getCurrent().getTemperature()));
            result.put("feelsLike", String.valueOf(wr.getCurrent().getFeelslike()));
            result.put("description", desc);
            return new ResponseEntity<>(result, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(Map.of("error", e.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}