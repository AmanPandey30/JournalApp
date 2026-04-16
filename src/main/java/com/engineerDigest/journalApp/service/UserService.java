package com.engineerDigest.journalApp.service;

import com.engineerDigest.journalApp.entity.User;
import com.engineerDigest.journalApp.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

//YAHA PAR HUM APNA BUSINESS LOGIC LIKHENGE AUR FIR CONTROLLER KO DENGE JAROORAT PADNE PE
//controller call karega service aur service repository ko
//controller--->service--->repository

@Service
@Slf4j  //->private static final Logger logger = LoggerFactory.getLogger(JournalEntryService.class);(iske jagah pe slf4j use karenge)
public class UserService {

    @Autowired
    private UserRepository userRepository;

    private  static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();



    public boolean saveNewUser(User user) {
        try {
            user.setPassWord(passwordEncoder.encode(user.getPassWord()));
            user.setRoles(Arrays.asList("USER"));
            userRepository.save(user); // Ye line hi database mein data bhejti hai
            return true;
        } catch (Exception e) {
            log.error("Error occurred while saving new user: ", e);
            return false;
        }
    }

    public void saveAdmin(User user){
        user.setPassWord(passwordEncoder.encode(user.getPassWord()));
        user.setRoles(Arrays.asList("USER","ADMIN"));
        userRepository.save(user); // Ye line hi database mein data bhejti hai

    }

    public void saveUser(User user){
        userRepository.save(user);
    }

    public List<User> getAll(){
        return userRepository.findAll();
    }

    public Optional<User> findById(ObjectId id){
        return userRepository.findById(id);
    }

    public void deleteById(ObjectId id){
        userRepository.deleteById(id);
    }

    public User findByUserName(String userName){
        return userRepository.findByUserName(userName);
    }
}
