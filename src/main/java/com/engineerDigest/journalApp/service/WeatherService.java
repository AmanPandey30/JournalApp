package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.api.response.WeatherResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class WeatherService {

    @Value("${weather.api.key}")
    private String apiKey;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private RedisService redisService;

    public WeatherResponse getWeather(String city) {
        WeatherResponse weatherResponse = redisService.get("weather_of_" + city, WeatherResponse.class);
        if (weatherResponse != null) {
            return weatherResponse;
        } else {
            try {
                String finalAPI = "http://api.weatherstack.com/current?access_key=" + apiKey + "&query=" + city;

                ResponseEntity<WeatherResponse> response = restTemplate.exchange(finalAPI, HttpMethod.GET, null, WeatherResponse.class);
                WeatherResponse body = response.getBody();

                if (body != null) {
                    redisService.set("weather_of_" + city, body, 300L);
                }
                return body;

            } catch (Exception e) {
                log.error("Weather API call failed for city: {}", city, e);
                return null;
            }
        }
    }
}