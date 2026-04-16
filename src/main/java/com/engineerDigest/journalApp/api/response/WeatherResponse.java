package com.engineerDigest.journalApp.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class WeatherResponse {

    // wttr.in returns current_condition as an array
    @JsonProperty("current_condition")
    private List<Current> currentList;

    @JsonProperty("nearest_area")
    private List<NearestArea> nearestArea;

    // Helper method — UserController getCurrent() call karta hai, backward compatible
    public Current getCurrent() {
        return (currentList != null && !currentList.isEmpty()) ? currentList.get(0) : null;
    }

    @Getter
    @Setter
    public static class Current {

        @JsonProperty("temp_C")
        private String temperature;

        @JsonProperty("FeelsLikeC")
        private String feelslike;

        @JsonProperty("weatherDesc")
        private List<WeatherDesc> weatherDescription;
    }

    @Getter
    @Setter
    public static class WeatherDesc {
        private String value;
    }

    @Getter
    @Setter
    public static class NearestArea {

        @JsonProperty("areaName")
        private List<AreaValue> areaName;
    }

    @Getter
    @Setter
    public static class AreaValue {
        private String value;
    }
}






