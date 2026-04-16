package com.engineerDigest.journalApp.controller;

import com.engineerDigest.journalApp.api.response.WeatherResponse;
import com.engineerDigest.journalApp.entity.User;
import com.engineerDigest.journalApp.repository.UserRepository;
import com.engineerDigest.journalApp.service.UserService;
import com.engineerDigest.journalApp.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WeatherService weatherService;

    @PutMapping
    public ResponseEntity<?> updateUser(@RequestBody User user) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User userInDb = userService.findByUserName(userName);
        if (userInDb != null) {
            userInDb.setUserName(user.getUserName());
            userInDb.setPassWord(user.getPassWord());
            userService.saveNewUser(userInDb);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping
    public ResponseEntity<?> deleteByUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userRepository.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @GetMapping
    public ResponseEntity<?> greeting() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        WeatherResponse weatherResponse = weatherService.getWeather("Mumbai");

        String greeting = "";

        if (weatherResponse != null && weatherResponse.getCurrent() != null) {
            WeatherResponse.Current current = weatherResponse.getCurrent();

            // City ka naam nearest_area se nikalna
            String cityName = "Mumbai";
            if (weatherResponse.getNearestArea() != null
                    && !weatherResponse.getNearestArea().isEmpty()
                    && weatherResponse.getNearestArea().get(0).getAreaName() != null
                    && !weatherResponse.getNearestArea().get(0).getAreaName().isEmpty()) {
                cityName = weatherResponse.getNearestArea().get(0).getAreaName().get(0).getValue();
            }

            // Weather description nikalna
            String weatherDesc = "";
            if (current.getWeatherDescription() != null && !current.getWeatherDescription().isEmpty()) {
                weatherDesc = ", Weather: " + current.getWeatherDescription().get(0).getValue();
            }

            greeting = " | City: " + cityName
                    + ", Temperature: " + current.getTemperature() + "°C"
                    + ", Feels like: " + current.getFeelslike() + "°C"
                    + weatherDesc;
        } else {
            System.out.println("Weather API response or current object is null");
        }

        return new ResponseEntity<>("Hi " + authentication.getName() + greeting, HttpStatus.OK);
    }
}