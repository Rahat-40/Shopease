package com.shopease.backend.services;

import com.shopease.backend.model.CartItem;
import com.shopease.backend.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;

    public List<CartItem> getCartByBuyer(String buyerEmail) {
        return cartItemRepository.findByBuyerEmail(buyerEmail);
    }

    // 1.  Prevents creating new duplicates in the future
    public CartItem addCartItem(CartItem newItem) {
        List<CartItem> existingItems = cartItemRepository.findByBuyerEmail(newItem.getBuyerEmail());
        
        // Check if product already exists in user's cart
        CartItem existingItem = existingItems.stream()
            .filter(item -> item.getProduct().getId().equals(newItem.getProduct().getId()))
            .findFirst()
            .orElse(null);

        if (existingItem != null) {
            // Update existing row instead of creating a new one
            existingItem.setQuantity(existingItem.getQuantity() + newItem.getQuantity());
            return cartItemRepository.save(existingItem);
        } else {
            return cartItemRepository.save(newItem);
        }
    }

    // Handles existing duplicates safely 
    @Transactional
    public CartItem updateCartItemQuantity(String buyerEmail, Long productId, int quantity) {
        if (quantity < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }

        // Fetch ALL items for this user
        List<CartItem> userItems = cartItemRepository.findByBuyerEmail(buyerEmail);
        
        // Filter for the specific product ID
        List<CartItem> targetItems = userItems.stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .collect(Collectors.toList());

        if (targetItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Item not found in cart");
        }

        //  Pick the first row as the 'main' one, delete the rest
        CartItem mainItem = targetItems.get(0);
        mainItem.setQuantity(quantity);
        
        // If duplicates exist, remove them now
        if (targetItems.size() > 1) {
            for (int i = 1; i < targetItems.size(); i++) {
                cartItemRepository.delete(targetItems.get(i));
            }
        }

        return cartItemRepository.save(mainItem);
    }
    
    @Transactional
    public void removeCartItem(String buyerEmail, Long productId) {
        cartItemRepository.deleteByBuyerEmailAndProductId(buyerEmail, productId);
    }
}