package com.shopease.backend.repository;

import com.shopease.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findBySellerEmail(String email);

    List<Product> findByActiveTrue();
    List<Product> findByActiveTrueAndCategoryIgnoreCase(String category);
    List<Product> findByActiveTrueAndNameContainingIgnoreCase(String q);
    List<Product> findByActiveTrueAndCategoryIgnoreCaseAndNameContainingIgnoreCase(String category, String q);

    List<Product> findBySellerEmailAndCategoryIgnoreCase(String email, String category);
    List<Product> findBySellerEmailAndNameContainingIgnoreCase(String email, String q);
    List<Product> findBySellerEmailAndCategoryIgnoreCaseAndNameContainingIgnoreCase(String email, String category, String q);
}
