package com.shopease.backend.services;

import com.shopease.backend.model.WishlistItem;
import com.shopease.backend.repository.WishlistItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class WishlistService {
    @Autowired
    private WishlistItemRepository wishlistItemRepository;

    public List<WishlistItem> getWishlistByBuyer(String buyerEmail) {
        return wishlistItemRepository.findByBuyerEmail(buyerEmail);
    }

    public WishlistItem addWishlistItem(WishlistItem wishlistItem) {
        return wishlistItemRepository.save(wishlistItem);
    }
    
    @Transactional
    public void removeWishlistItem(String buyerEmail, Long productId) {
        wishlistItemRepository.deleteByBuyerEmailAndProductId(buyerEmail, productId);
    }
}
