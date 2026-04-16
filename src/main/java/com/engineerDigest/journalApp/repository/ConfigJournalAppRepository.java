package com.engineerDigest.journalApp.repository;

import com.engineerDigest.journalApp.entity.ConfigJournalEntry;
import com.engineerDigest.journalApp.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ConfigJournalAppRepository extends MongoRepository<ConfigJournalEntry, ObjectId> {

}
