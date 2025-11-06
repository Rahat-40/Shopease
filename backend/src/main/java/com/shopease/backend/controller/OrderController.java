package com.shopease.backend.controller;

import com.shopease.backend.model.Order;
import com.shopease.backend.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

  @Autowired private OrderService orderService;

  @PreAuthorize("hasRole('BUYER')")
  @GetMapping("/buyer/me")
  public List<Order> getBuyerOrdersMe(Authentication auth) {
    return orderService.getOrdersByBuyer(auth.getName());
  }

  @PreAuthorize("hasRole('SELLER')")
  @GetMapping("/seller/me")
  public List<Order> getSellerOrdersMe(Authentication auth,
                                       @RequestParam(required = false) List<String> status) {
    return orderService.getOrdersBySeller(auth.getName(), status);
  }

  @PreAuthorize("hasRole('BUYER')")
  @PostMapping
  public Order placeOrder(@RequestBody Order order, Authentication auth) {
    return orderService.placeOrder(order, auth.getName());
  }

  @PreAuthorize("hasRole('SELLER')")
  @PutMapping("/{id}/status")
  public Order sellerUpdateStatus(@PathVariable Long id,
                                  @RequestParam String status,
                                  Authentication auth) {
    return orderService.updateOrderStatusOwned(id, status, auth.getName());
  }

  @PreAuthorize("hasRole('BUYER')")
  @PutMapping("/{id}/cancel")
  public Order buyerCancel(@PathVariable Long id, Authentication auth) {
    return orderService.cancelOrderByBuyer(id, auth.getName());
  }
}
