package com.shopease.backend.repository;

import com.shopease.backend.model.WishlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WishlistItemRepository extends JpaRepository<WishlistItem, Long> {
    List<WishlistItem> findByBuyerEmail(String email);
    void deleteByBuyerEmailAndProductId(String email, Long productId);
}
