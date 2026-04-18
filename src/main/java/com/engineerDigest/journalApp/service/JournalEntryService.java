package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.entity.JournalEntry;
import com.engineerDigest.journalApp.entity.User;
import com.engineerDigest.journalApp.repository.JournalEntryRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class JournalEntryService {

    @Autowired
    private JournalEntryRepository journalEntryRepository;

    @Autowired
    private UserService userService;

    /**
     * Journal entry ko save karo aur user ke entry list mein add karo.
     */
    @Transactional
    public void saveEntry(JournalEntry journalEntry, String userName) {
        try {
            User user = userService.findByUserName(userName);
            journalEntry.setDate(LocalDateTime.now());

            // ── Step 1: Save the entry immediately so the user doesn't wait ──
            JournalEntry saved = journalEntryRepository.save(journalEntry);
            user.getJournalEntries().add(saved);
            userService.saveUser(user);

        } catch (Exception e) {
            log.error("Error saving journal entry", e);
            throw new RuntimeException("An error occurred while saving the entry.", e);
        }
    }

    // ── Simple save (no user context) ─────────────────────────────────────
    public void saveEntry(JournalEntry journalEntry) {
        journalEntryRepository.save(journalEntry);
    }

    public List<JournalEntry> getAll() {
        return journalEntryRepository.findAll();
    }

    public Optional<JournalEntry> findById(ObjectId id) {
        return journalEntryRepository.findById(id);
    }

    @Transactional
    public boolean deleteById(ObjectId id, String userName) {
        boolean removed = false;
        try {
            User user = userService.findByUserName(userName);
            removed = user.getJournalEntries().removeIf(x -> x.getId().equals(id));
            if (removed) {
                userService.saveUser(user);
                journalEntryRepository.deleteById(id);
            }
        } catch (Exception e) {
            log.error("Error deleting entry", e);
            throw new RuntimeException("An error occurred while deleting the entry.", e);
        }
        return removed;
    }

    public List<JournalEntry> findByUserName(String userName) {
        return userService.findByUserName(userName).getJournalEntries();
    }
}
