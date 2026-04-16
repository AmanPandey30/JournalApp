package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.api.response.WeatherResponse;
import com.engineerDigest.journalApp.cache.AppCache;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class WeatherService {

    // ✅ wttr.in — Free API, koi API key nahi chahiye
    private static final String API = "https://wttr.in/<city>?format=j1";

    @Autowired
    private AppCache appCache;

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
                String finalAPI = appCache.APP_CACHE.get("WEATHER_API").replace("<city>", city);

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