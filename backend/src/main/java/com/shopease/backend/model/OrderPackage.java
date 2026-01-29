package com.shopease.backend.model;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_packages")
public class OrderPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String buyerEmail;
    
    //  Field to hold the payment method ("COD" or "ONLINE")
    private String paymentMethod; 

    // Transaction/Payment Fields
    private String transactionId; 
    private Double totalAmount;
    private String paymentStatus = "PENDING"; 

    // Shipping/Buyer Info
    private String buyerName;
    private String buyerPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingPostcode;

    @Column(name = "created_at", nullable = false)
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Column(name = "order_date", nullable = false)
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime orderDate;

    @OneToMany(mappedBy = "orderPackage", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<Order> orders;

    private String status; // PENDING_PAYMENT, PENDING_CONFIRMATION, PLACED, etc.

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.orderDate = LocalDateTime.now();
        if (this.status == null) this.status = "PENDING_PAYMENT";
        if (this.paymentStatus == null) this.paymentStatus = "PENDING";
    }

    //  Helper to calculate total for SSLCommerz
    public Double calculateTotal() {
        if (orders == null || orders.isEmpty()) return 0.0;
        return orders.stream()
            .mapToDouble(order -> order.getUnitPrice() * order.getQuantity())
            .sum();
    }
    
    
    // Explicit Getters/Setters for the new field
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBuyerEmail() { return buyerEmail; }
    public void setBuyerEmail(String buyerEmail) { this.buyerEmail = buyerEmail; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getBuyerName() { return buyerName; }
    public void setBuyerName(String buyerName) { this.buyerName = buyerName; }
    public String getBuyerPhone() { return buyerPhone; }
    public void setBuyerPhone(String buyerPhone) { this.buyerPhone = buyerPhone; }
    public String getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(String shippingAddress) { this.shippingAddress = shippingAddress; }
    public String getShippingCity() { return shippingCity; }
    public void setShippingCity(String shippingCity) { this.shippingCity = shippingCity; }
    public String getShippingPostcode() { return shippingPostcode; }
    public void setShippingPostcode(String shippingPostcode) { this.shippingPostcode = shippingPostcode; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public void setOrderDate(LocalDateTime orderDate) { this.orderDate = orderDate; }
    public List<Order> getOrders() { return orders; }
    public void setOrders(List<Order> orders) { this.orders = orders; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}