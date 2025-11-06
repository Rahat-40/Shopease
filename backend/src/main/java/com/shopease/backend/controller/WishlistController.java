package com.shopease.backend.controller;

import com.shopease.backend.model.WishlistItem;
import com.shopease.backend.services.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @Autowired
    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @PreAuthorize("hasRole('BUYER')")
    @GetMapping("/{email}")
    public List<WishlistItem> getWishlist(@PathVariable String email) {
        return wishlistService.getWishlistByBuyer(email);
    }

    @PreAuthorize("hasRole('BUYER')")
    @PostMapping
    public WishlistItem add(@RequestBody WishlistItem wishlistItem) {
        return wishlistService.addWishlistItem(wishlistItem);
    }

    @PreAuthorize("hasRole('BUYER')")
    @DeleteMapping("/{email}/{productId}")
    public void remove(@PathVariable String email, @PathVariable Long productId) {
        wishlistService.removeWishlistItem(email, productId);
    }
}
