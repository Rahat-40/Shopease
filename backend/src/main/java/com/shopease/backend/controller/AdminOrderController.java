package com.shopease.backend.controller;

import com.shopease.backend.model.Order;
import com.shopease.backend.services.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {
  private final OrderService service;
  public AdminOrderController(OrderService service){ this.service = service; }

  @GetMapping
  public List<Order> list(@RequestParam(required=false) String status){
    return service.listAllForAdmin(status);
  }

  @GetMapping("/{id}")
  public Order get(@PathVariable Long id){
    return service.getByIdForAdmin(id);
  }

  @PutMapping("/{id}/status")
  public Order setStatus(@PathVariable Long id, @RequestParam String status){
    return service.setStatusAdmin(id, status);
  }
}
