package com.engineerDigest.journalApp.controller;

import com.engineerDigest.journalApp.entity.JournalEntry;
import com.engineerDigest.journalApp.entity.User;
import com.engineerDigest.journalApp.service.JournalAIEngine;
import com.engineerDigest.journalApp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/ai")
public class ChatbotController {

    @Autowired
    private JournalAIEngine aiEngine;
    
    @Autowired
    private UserService userService;

    // ── FEATURE C: CHAT WITH JOURNAL ──
    @PostMapping("/chat")
    public ResponseEntity<?> chatWithMyJournal(@RequestBody Map<String, String> payload) {
        String question = payload.get("question");
        if(question == null || question.isEmpty()) return new ResponseEntity<>(HttpStatus.BAD_REQUEST);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userService.findByUserName(auth.getName());
        
        List<String> pastEntriesText = user.getJournalEntries().stream()
                .map(JournalEntry::getContent)
                .collect(Collectors.toList());

        String answer = aiEngine.chatWithJournal(question, pastEntriesText);
        
        Map<String, String> response = new HashMap<>();
        response.put("answer", answer);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ── FEATURE D: SMART WRITING COACH ──
    @PostMapping("/suggest")
    public ResponseEntity<?> getWritingSuggestion(@RequestBody Map<String, String> payload) {
        String currentText = payload.get("text");
        String suggestion = aiEngine.getSmartSuggestion(currentText);
        
        Map<String, String> response = new HashMap<>();
        response.put("suggestion", suggestion);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
