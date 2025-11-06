package com.shopease.backend.repository;

import com.shopease.backend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerEmail(String email);
    // Buyer
    List<Order> findByBuyerEmailOrderByIdDesc(String email);

 // Seller scope via association path (no @Query)
    List<Order> findDistinctByProduct_SellerEmailOrderByIdDesc(String sellerEmail);

    // Optional status filter for UI
    List<Order> findDistinctByProduct_SellerEmailAndStatusInOrderByIdDesc(String sellerEmail, Collection<String> statuses);

    long countBySellerEmailAndStatusIn(String sellerEmail, Collection<String> statuses);
    long countBySellerEmailAndStatus(String sellerEmail, String status);
}
