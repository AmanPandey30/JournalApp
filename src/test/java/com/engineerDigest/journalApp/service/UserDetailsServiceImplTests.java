package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.repository.UserRepository;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.ArrayList;

import static org.mockito.Mockito.when;

public class UserDetailsServiceImplTests {

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setup(){
        MockitoAnnotations.initMocks(this);
    }

    @Test
    void LoadUserByUserNameTest(){
        // Step 1: Apni entity class ka object banayein (Mock Data)
        com.engineerDigest.journalApp.entity.User mockUser = new com.engineerDigest.journalApp.entity.User();
        mockUser.setUserName("ram");
        mockUser.setPassWord("inrichkk");
        mockUser.setRoles(new ArrayList<>()); // Roles empty list set karein taaki NullPointerException na aaye

        // Step 2: Repository se is mockUser ko return karwayein
        when(userRepository.findByUserName(ArgumentMatchers.anyString())).thenReturn(mockUser);

        // Step 3: Service call karein
        UserDetails user = userDetailsService.loadUserByUsername("ram");

        // Step 4: Assertions
        Assertions.assertNotNull(user);
        Assertions.assertEquals("ram", user.getUsername());
    }
}