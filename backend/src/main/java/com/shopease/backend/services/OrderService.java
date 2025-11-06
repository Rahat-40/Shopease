package com.shopease.backend.services;

import com.shopease.backend.model.Order;
import com.shopease.backend.model.Product;
import com.shopease.backend.repository.OrderRepository;
import com.shopease.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class OrderService {

  @Autowired private OrderRepository orderRepository;
  @Autowired private ProductRepository productRepository;

  public List<Order> getOrdersByBuyer(String buyerEmail) {
    return orderRepository.findByBuyerEmailOrderByIdDesc(buyerEmail);
  }

  public List<Order> getOrdersBySeller(String sellerEmail, List<String> statuses) {
    if (statuses == null || statuses.isEmpty()) {
      return orderRepository.findDistinctByProduct_SellerEmailOrderByIdDesc(sellerEmail);
    }
    return orderRepository.findDistinctByProduct_SellerEmailAndStatusInOrderByIdDesc(sellerEmail, statuses);
  }

  @Transactional
  public Order placeOrder(Order order, String buyerEmail) {
    Product product = productRepository.findById(order.getProduct().getId())
        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

    if (product.getStock() == null || product.getStock() < order.getQuantity()) {
      throw new IllegalStateException("Insufficient stock available");
    }

    product.setStock(product.getStock() - order.getQuantity());
    productRepository.save(product);

    order.setBuyerEmail(buyerEmail);
    order.setSellerEmail(product.getSellerEmail()); // optional redundancy
    order.setStatus("PLACED");
    //order.setOrderDate(java.time.Instant.now());

    return orderRepository.save(order);
  }

  @Transactional
  public Order updateOrderStatusOwned(Long id, String nextStatus, String sellerEmail) {
    Order o = orderRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));

    if (o.getProduct() == null || !sellerEmail.equals(o.getProduct().getSellerEmail())) {
      throw new AccessDeniedException("Not your order");
    }

    Map<String, List<String>> valid = Map.of(
        "PLACED", List.of("CONFIRMED", "CANCELLED"),
        "CONFIRMED", List.of("SHIPPED", "CANCELLED"),
        "SHIPPED", List.of("DELIVERED"),
        "DELIVERED", List.of(),
        "CANCELLED", List.of()
    );

    String cur = o.getStatus();
    if (!valid.containsKey(cur) || !valid.get(cur).contains(nextStatus)) {
      throw new IllegalArgumentException("Invalid transition: " + cur + " → " + nextStatus);
    }

    if ("CANCELLED".equals(nextStatus) && Set.of("PLACED", "CONFIRMED").contains(cur)) {
    	Product p = o.getProduct();
    	if (p != null) {
    	  int currentStock = p.getStock() == null ? 0 : p.getStock();
    	  p.setStock(currentStock + o.getQuantity());
    	  productRepository.save(p);
    	}

    }

    o.setStatus(nextStatus);
    return orderRepository.save(o);
  }

  @Transactional
  public Order cancelOrderByBuyer(Long id, String buyerEmail) {
    Order o = orderRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Order not found"));

    if (!buyerEmail.equals(o.getBuyerEmail())) {
      throw new AccessDeniedException("Not your order");
    }
    if (!Set.of("PLACED", "CONFIRMED").contains(o.getStatus())) {
      throw new IllegalStateException("Order cannot be cancelled at this stage");
    }

    Product p = o.getProduct();
    if (p != null) {
      int currentStock = p.getStock() == null ? 0 : p.getStock();
      p.setStock(currentStock + o.getQuantity());
      productRepository.save(p);
    }


    o.setStatus("CANCELLED");
    return orderRepository.save(o);
  }
  
  
  // for admin // Add inside OrderService
  public List<Order> listAllForAdmin(String status) {
	  List<Order> all = orderRepository.findAll();
	  if (status == null || status.isBlank()) return all;
	  String s = status.toUpperCase();
	  return all.stream().filter(o -> s.equalsIgnoreCase(o.getStatus())).toList();
	}

	public Order getByIdForAdmin(Long id) {
	  return orderRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Order not found"));
	}

	@org.springframework.transaction.annotation.Transactional
	public Order setStatusAdmin(Long id, String nextStatus) {
	  Order o = getByIdForAdmin(id);
	  java.util.Map<String, java.util.List<String>> valid = java.util.Map.of(
	    "PLACED", java.util.List.of("CONFIRMED", "CANCELLED"),
	    "CONFIRMED", java.util.List.of("SHIPPED", "CANCELLED"),
	    "SHIPPED", java.util.List.of("DELIVERED"),
	    "DELIVERED", java.util.List.of(),
	    "CANCELLED", java.util.List.of()
	  );
	  String cur = o.getStatus();
	  if (!valid.containsKey(cur) || !valid.get(cur).contains(nextStatus)) {
	    throw new IllegalArgumentException("Invalid transition: " + cur + " → " + nextStatus);
	  }
	  if ("CANCELLED".equals(nextStatus) && java.util.Set.of("PLACED","CONFIRMED").contains(cur)) {
	    Product p = o.getProduct();
	    if (p != null) {
	      int currentStock = p.getStock() == null ? 0 : p.getStock();
	      p.setStock(currentStock + o.getQuantity());
	      productRepository.save(p);
	    }
	  }
	  o.setStatus(nextStatus);
	  return orderRepository.save(o);
	}

}
