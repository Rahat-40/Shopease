package com.shopease.backend.services;

import com.shopease.backend.model.CartItem;
import com.shopease.backend.repository.CartItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CartService {
    @Autowired
    private CartItemRepository cartItemRepository;

    public List<CartItem> getCartByBuyer(String buyerEmail) {
        return cartItemRepository.findByBuyerEmail(buyerEmail);
    }

    public CartItem addCartItem(CartItem cartItem) {
        return cartItemRepository.save(cartItem);
    }
    
    @Transactional
    public void removeCartItem(String buyerEmail, Long productId) {
        cartItemRepository.deleteByBuyerEmailAndProductId(buyerEmail, productId);
    }
}
