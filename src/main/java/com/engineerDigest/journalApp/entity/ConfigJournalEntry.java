package com.engineerDigest.journalApp.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "config_journal_app")
@Data
@NoArgsConstructor
public class ConfigJournalEntry {

    @Id
    private ObjectId id; // ✅ @Id add kiya — MongoDB document ka primary key

    private String key;
    private String value;

}


