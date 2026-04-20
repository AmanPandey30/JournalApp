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

    @Value("${weather.api.key:}")
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
                String lat = "18.9750";
                String lon = "72.8258";
                String cityName = "Mumbai";

                if (city.contains(",")) {
                    String[] parts = city.split(",");
                    if(parts.length == 2) {
                        lat = parts[0]; lon = parts[1];
                        cityName = "Current Location";
                        // Reverse geocoding to find city name
                        try {
                            String geoUrl = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en";
                            ResponseEntity<String> geoResp = restTemplate.exchange(geoUrl, HttpMethod.GET, null, String.class);
                            com.fasterxml.jackson.databind.ObjectMapper m = new com.fasterxml.jackson.databind.ObjectMapper();
                            com.fasterxml.jackson.databind.JsonNode geoRoot = m.readTree(geoResp.getBody());
                            if(geoRoot.has("city") && !geoRoot.get("city").asText().isEmpty()) {
                                cityName = geoRoot.get("city").asText();
                            } else if(geoRoot.has("locality") && !geoRoot.get("locality").asText().isEmpty()) {
                                cityName = geoRoot.get("locality").asText();
                            }
                        } catch(Exception ignored) {}
                    }
                } else if (!city.equalsIgnoreCase("Mumbai")) {
                    cityName = city;
                }

                String finalAPI = "https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true";

                ResponseEntity<String> response = restTemplate.exchange(finalAPI, HttpMethod.GET, null, String.class);
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                com.fasterxml.jackson.databind.JsonNode root = mapper.readTree(response.getBody());
                
                WeatherResponse finalResp = new WeatherResponse();
                
                WeatherResponse.Location loc = new WeatherResponse.Location();
                loc.setName(cityName);
                finalResp.setLocation(loc);
                
                WeatherResponse.Current cur = new WeatherResponse.Current();
                if(root.has("current_weather")) {
                    com.fasterxml.jackson.databind.JsonNode cw = root.get("current_weather");
                    double temp = cw.get("temperature").asDouble();
                    cur.setTemperature((int)temp);
                    cur.setFeelslike((int)temp + 1);
                    int code = cw.get("weathercode").asInt();
                    // Open-Meteo WMO weather interpretation
                    String desc = code >= 95 ? "Thunderstorm" : 
                                 code >= 51 ? "Rain" : 
                                 code >= 45 ? "Fog" : 
                                 code >= 1 ? "Cloudy" : "Sunny";
                    cur.setWeatherDescriptions(java.util.Arrays.asList(desc));
                } else {
                    return null;
                }
                finalResp.setCurrent(cur);

                redisService.set("weather_of_" + city, finalResp, 300L);
                return finalResp;

            } catch (Exception e) {
                log.error("Weather API call failed for city: {}", city, e);
                return null;
            }
        }
    }
}