package com.shopease.backend.repository;

import com.shopease.backend.model.OrderPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface OrderPackageRepository extends JpaRepository<OrderPackage, Long> {
    List<OrderPackage> findByBuyerEmailOrderByIdDesc(String buyerEmail);
 // Method for finding order during payment callback
    Optional<OrderPackage> findByTransactionId(String transactionId);
    
}
