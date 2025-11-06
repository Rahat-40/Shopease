package com.shopease.backend.controller;

import com.shopease.backend.repository.UserRepository;
import com.shopease.backend.repository.ProductRepository;
import com.shopease.backend.repository.OrderRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminStatsController {
  private final UserRepository users;
  private final ProductRepository products;
  private final OrderRepository orders;

  public AdminStatsController(UserRepository users, ProductRepository products, OrderRepository orders) {
    this.users = users; this.products = products; this.orders = orders;
  }

  @GetMapping("/stats")
  public ResponseEntity<Map<String, Object>> stats() {
    long usersCount = users.count();
    long productsCount = products.count();
    long ordersPending = orders.findAll().stream()
      .filter(o -> {
        String s = o.getStatus() == null ? "" : o.getStatus().toUpperCase();
        return s.equals("PLACED") || s.equals("CONFIRMED");
      }).count();

    return ResponseEntity.ok(Map.of(
      "users", usersCount,
      "products", productsCount,
      "ordersPending", ordersPending,
      "ticketsOpen", 0 // set 0 since no ticket model without DTO here
    ));
  }
}
