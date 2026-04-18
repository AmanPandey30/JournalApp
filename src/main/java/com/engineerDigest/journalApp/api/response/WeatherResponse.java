package com.engineerDigest.journalApp.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WeatherResponse {

    private Current current;
    private Location location;

    @Getter
    @Setter
    public static class Current {
        private int temperature;

        @JsonProperty("weather_descriptions")
        private List<String> weatherDescriptions;

        private int feelslike;
    }

    @Getter
    @Setter
    public static class Location {
        private String name;
    }
}
