package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.schedular.UserSchedular;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class UserSchedularsTest {

    @Autowired
    private UserSchedular userSchedular;

    @Test
    public void testFetchUsersAndSendSAMail(){
        userSchedular.fetchUsersAndSendSaMail();
    }
}
