package com.engineerDigest.journalApp.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class JournalAIEngine {

    // ── 1. MOOD TRACKER (SENTIMENT ANALYSIS) ──
    private static final Set<String> POSITIVE_WORDS = new HashSet<>(Arrays.asList(
            "happy", "joy", "great", "excellent", "good", "proud", "amazing", "love", "peace", "excited", "achieved", "won", "blessed"
    ));

    private static final Set<String> NEGATIVE_WORDS = new HashSet<>(Arrays.asList(
            "sad", "bad", "angry", "stress", "pain", "failed", "hurt", "depressed", "tired", "worst", "hate", "cry", "upset"
    ));

    public String analyzeMood(String text) {
        if (text == null || text.trim().isEmpty()) return "😐 Neutral";
        
        String[] words = text.toLowerCase().replaceAll("[^a-z\\s]", "").split("\\s+");
        int score = 0;
        
        for (String word : words) {
            if (POSITIVE_WORDS.contains(word)) score++;
            else if (NEGATIVE_WORDS.contains(word)) score--;
        }
        
        if (score > 0) return "😊 Happy";
        if (score < 0) return "😔 Sad";
        return "😐 Neutral";
    }

    // ── 2. AUTO-TAGGING & SUMMARIZATION ──
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
            "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
            "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
            "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
            "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
            "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
            "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
            "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
            "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
            "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
            "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
            "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
    ));

    public List<String> extractTags(String text) {
        if (text == null || text.trim().isEmpty()) return new ArrayList<>();
        
        String[] words = text.toLowerCase().replaceAll("[^a-z\\s]", "").split("\\s+");
        Map<String, Integer> wordCount = new HashMap<>();
        
        for (String word : words) {
            if (word.length() > 2 && !STOP_WORDS.contains(word)) {
                wordCount.put(word, wordCount.getOrDefault(word, 0) + 1);
            }
        }
        
        // Sort by frequency and get top 3 tags
        List<Map.Entry<String, Integer>> list = new ArrayList<>(wordCount.entrySet());
        list.sort((a, b) -> b.getValue().compareTo(a.getValue()));
        
        List<String> tags = new ArrayList<>();
        for (int i = 0; i < Math.min(3, list.size()); i++) {
            tags.add(list.get(i).getKey());
        }
        return tags;
    }

    // ── 3. CHATBOT ENGINE (RULE-BASED) ──
    public String chatWithJournal(String question, List<String> userPastEntriesText) {
        String q = question.toLowerCase();
        
        if (q.contains("mood") || q.contains("how was i feeling")) {
            int happyCount = 0;
            for (String entry : userPastEntriesText) {
                if (analyzeMood(entry).contains("Happy")) happyCount++;
            }
            return "Based on your past entries, you've completely felt happy in " + happyCount + " entries. Keep up the positivity!";
        }
        
        if (q.contains("summarize") || q.contains("summary")) {
            return "You have " + userPastEntriesText.size() + " journal entries. To get a summary, just keep writing clearly!";
        }
        
        return "I am your personal Local AI. I noticed you have " + userPastEntriesText.size() + " entries written. Ask me about your 'mood' or to 'summarize'!";
    }

    // ── 4. SMART WRITING COACH ──
    public String getSmartSuggestion(String currentTypingText) {
        if (currentTypingText == null || currentTypingText.length() < 10) {
            return "Keep writing! Tell me more about your day...";
        }
        
        String mood = analyzeMood(currentTypingText);
        if (mood.contains("Happy")) {
            return "That sounds wonderful! What made it so special?";
        } else if (mood.contains("Sad")) {
            return "I hear you. It's okay to feel this way. What could make you feel a little better?";
        }
        return "Interesting thought. What happened next?";
    }
}
