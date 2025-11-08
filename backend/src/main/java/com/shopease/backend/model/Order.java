package com.shopease.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String buyerEmail;
    private String sellerEmail;
    private int quantity;
    private String status;


    @Column(name = "order_date", nullable = false)
    @JsonFormat(pattern="yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime orderDate;

    // Many-to-one relation to fetch product details
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")//, insertable = false, updatable = false)
    private Product product;

    // Auto set orderDate before persisting
    @PrePersist
    protected void onCreate() {
        this.orderDate = LocalDateTime.now();
    }

	public Long getId() {
		return id;
	}



	public void setId(Long id) {
		this.id = id;
	}



	public String getBuyerEmail() {
		return buyerEmail;
	}



	public void setBuyerEmail(String buyerEmail) {
		this.buyerEmail = buyerEmail;
	}



	public String getSellerEmail() {
		return sellerEmail;
	}



	public void setSellerEmail(String sellerEmail) {
		this.sellerEmail = sellerEmail;
	}



	public int getQuantity() {
		return quantity;
	}



	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}



	public String getStatus() {
		return status;
	}



	public void setStatus(String status) {
		this.status = status;
	}



	public Product getProduct() {
		return product;
	}



	public void setProduct(Product product) {
		this.product = product;
	}
    
}