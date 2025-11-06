package com.shopease.backend.repository;

import com.shopease.backend.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByBuyerEmail(String email);
    void deleteByBuyerEmailAndProductId(String email, Long productId);
}