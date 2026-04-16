package com.engineerDigest.journalApp.cache;

import com.engineerDigest.journalApp.entity.ConfigJournalEntry;
import com.engineerDigest.journalApp.repository.ConfigJournalAppRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class AppCache {

    public enum keys {
        WEATHER_API;
    }

    @Autowired
    private ConfigJournalAppRepository configJournalAppRepository; // ✅ static nahi — Spring inject kar sakta hai

    public Map<String, String> APP_CACHE = new HashMap<>();

    @PostConstruct
    public void init() { // ✅ static nahi — Spring @PostConstruct ke liye zaruri hai
        List<ConfigJournalEntry> all = configJournalAppRepository.findAll();
        for (ConfigJournalEntry configJournalEntry : all) {
            APP_CACHE.put(configJournalEntry.getKey(), configJournalEntry.getValue());
        }
    }
}

