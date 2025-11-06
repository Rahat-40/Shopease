package com.shopease.backend.services;

import com.shopease.backend.model.User;
import com.shopease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public List<User> listAll(String q) {
    	  List<User> all = userRepository.findAll();
    	  if (q == null || q.isBlank()) return all;
    	  String s = q.toLowerCase();
    	  return all.stream().filter(u -> u.getEmail()!=null && u.getEmail().toLowerCase().contains(s)).toList();
    	}

    	public void changeRole(Long id, String role) {
    	  User u = userRepository.findById(id).orElseThrow();
    	  u.setRole(role);
    	  userRepository.save(u);
    	}

    	public void deleteById(Long id) {
    	  userRepository.deleteById(id);
    	}
}
