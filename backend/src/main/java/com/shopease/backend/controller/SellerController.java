// src/main/java/com/shopease/backend/controller/SellerController.java
package com.shopease.backend.controller;

import com.shopease.backend.model.Product;
import com.shopease.backend.repository.ProductRepository;
import com.shopease.backend.repository.OrderRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

  private final ProductRepository productRepository;
  private final OrderRepository orderRepository;

  public SellerController(ProductRepository productRepository, OrderRepository orderRepository) {
    this.productRepository = productRepository;
    this.orderRepository = orderRepository;
  }

  @PreAuthorize("hasRole('SELLER')")
  @GetMapping("/overview")
  public Map<String, Long> getOverview(Authentication auth) {
    String email = auth.getName();

    List<Product> mine = productRepository.findBySellerEmail(email);
    long totalProducts = mine.size();
    long activeListings = mine.stream().filter(Product::isActive).count();

    long pendingOrders = orderRepository.countBySellerEmailAndStatusIn(email, java.util.List.of("PLACED","CONFIRMED"));
    long deliveredOrders = orderRepository.countBySellerEmailAndStatus(email, "DELIVERED");

    return Map.of(
      "totalProducts", totalProducts,
      "activeListings", activeListings,
      "pendingOrders", pendingOrders,
      "deliveredOrders", deliveredOrders
    );
  }
}
