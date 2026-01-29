package com.shopease.backend.controller;

import com.shopease.backend.model.Review;
import com.shopease.backend.services.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @GetMapping("/{productId}")
    public ResponseEntity<List<Review>> list(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsForProduct(productId));
    }

    @PreAuthorize("hasRole('BUYER')")
    @PostMapping("/{productId}")
    public ResponseEntity<Review> add(
            @PathVariable Long productId,
            @RequestBody Map<String, Object> body,
            Authentication auth
    ) {
        Integer rating = (Integer) body.get("rating");
        String comment = (String) body.get("comment");

        Review saved = reviewService.addReview(
                productId,
                rating,
                comment,
                auth.getName()
        );

        return ResponseEntity.ok(saved);
    }
}
