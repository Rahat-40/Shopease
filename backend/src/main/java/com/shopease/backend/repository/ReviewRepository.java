package com.shopease.backend.repository;

import com.shopease.backend.model.Product;
import com.shopease.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductOrderByCreatedAtDesc(Product product);
    boolean existsByProductAndUserEmail(Product product, String userEmail);
}
