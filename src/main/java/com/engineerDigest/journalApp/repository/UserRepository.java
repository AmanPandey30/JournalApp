package com.engineerDigest.journalApp.repository;

import com.engineerDigest.journalApp.entity.JournalEntry;
import com.engineerDigest.journalApp.entity.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, ObjectId> {
           User findByUserName(String username);

           void deleteByUserName(String username);
}
