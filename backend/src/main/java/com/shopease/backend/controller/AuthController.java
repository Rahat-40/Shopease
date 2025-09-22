package com.shopease.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.shopease.backend.model.User;
import com.shopease.backend.repository.UserRepository;
import java.util.Map;

//@CrossOrigin(origins = "http://localhost:5173")  // <-- add this
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/register")
    public User register(@RequestBody User user){
        user.setRole("BUYER");
        return userRepo.save(user);
    }

    @PostMapping("/login")
    public Map<String,String> login(@RequestBody Map<String,String> creds){
        User user = userRepo.findByEmail(creds.get("email")).orElseThrow();
        if(!user.getPassword().equals(creds.get("password"))){
            throw new RuntimeException("Invalid credentials");
        }
        return Map.of("message", "Login successful", "role", user.getRole());
    }
}
