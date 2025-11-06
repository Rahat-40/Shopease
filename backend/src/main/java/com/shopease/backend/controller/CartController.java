package com.shopease.backend.controller;

import com.shopease.backend.model.CartItem;

import com.shopease.backend.services.CartService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    
    @Autowired
    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PreAuthorize("hasRole('BUYER')")
    @GetMapping("/{email}")
    public List<CartItem> getCart(@PathVariable String email) {
        return cartService.getCartByBuyer(email);
    }
    
    @PreAuthorize("hasRole('BUYER')")
    @PostMapping
    public CartItem add(@RequestBody CartItem cartItem) {
        return cartService.addCartItem(cartItem);
    }
    
    @PreAuthorize("hasRole('BUYER')")
    @DeleteMapping("/{email}/{productId}")
    public void remove(@PathVariable String email, @PathVariable Long productId) {
        cartService.removeCartItem(email, productId);
    }
}
