
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
@RequestMapping("/api/admin/contact")
@PreAuthorize("hasRole('ADMIN')")
public class AdminContactController {
private final ContactService service;
public AdminContactController(ContactService service){ this.service = service; }

@GetMapping
public List<ContactMessage> list(@RequestParam(required=false) String status){
return service.listAll(status);
}

@GetMapping("/{id}")
public ContactMessage thread(@PathVariable Long id){
return service.getThreadForAdmin(id);
}

@PostMapping("/{id}/reply")
public ResponseEntity<?> reply(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication auth){
String body = payload.getOrDefault("body", "");
service.adminReply(id, body, auth.getName());
return ResponseEntity.ok(Map.of("message","Replied"));
}

@DeleteMapping("/{id}")
public ResponseEntity<?> delete(@PathVariable Long id){
service.deleteTicketByAdmin(id);
return ResponseEntity.ok(Map.of("message","Ticket deleted"));
}
}