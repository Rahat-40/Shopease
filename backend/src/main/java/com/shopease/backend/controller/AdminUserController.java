package com.shopease.backend.controller;

import com.shopease.backend.model.User;
import com.shopease.backend.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
  private final UserService service;
  public AdminUserController(UserService service){ this.service = service; }

  @GetMapping
  public List<User> list(@RequestParam(required=false) String q){
    return service.listAll(q);
  }

  @PutMapping("/{id}/role")
  public ResponseEntity<?> role(@PathVariable Long id, @RequestParam String role){
    service.changeRole(id, role);
    return ResponseEntity.ok(Map.of("message","Role updated"));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Long id){
    service.deleteById(id);
    return ResponseEntity.ok(Map.of("message","User deleted"));
  }
}
