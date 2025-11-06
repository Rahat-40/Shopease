package com.shopease.backend.controller;

import com.shopease.backend.model.ContactMessage;
import com.shopease.backend.services.ContactService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
public class ContactController {

private final ContactService service;
public ContactController(ContactService service){ this.service = service; }

@PostMapping
public ResponseEntity<?> create(@RequestBody Map<String, String> body, Authentication auth){
String name = body.getOrDefault("name", "");
String email = body.getOrDefault("email", "");
String subject = body.getOrDefault("subject", "");
String message = body.getOrDefault("message", "");
String authEmail = auth != null ? auth.getName() : email;
Long id = service.create(name, email, subject, message, authEmail);
return ResponseEntity.ok(Map.of("id", id, "message", "Message received"));
}

@PreAuthorize("isAuthenticated()")
@GetMapping("/mine")
public List<ContactMessage> mine(Authentication auth){
return service.listMine(auth.getName());
}

@PreAuthorize("isAuthenticated()")
@GetMapping("/{id}")
public ContactMessage thread(@PathVariable Long id, Authentication auth){
return service.getThreadForUser(id, auth.getName());
}
}