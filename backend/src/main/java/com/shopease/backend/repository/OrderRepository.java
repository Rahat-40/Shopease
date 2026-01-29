package com.shopease.backend.repository;

import com.shopease.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    
	// Get all orders for products sold by a seller
    List<Order> findByProduct_SellerEmailOrderByIdDesc(String sellerEmail);

    long countByProduct_SellerEmailAndStatusIn(String sellerEmail, List<String> statuses);

    long countByProduct_SellerEmailAndStatus(String sellerEmail, String status);
}
