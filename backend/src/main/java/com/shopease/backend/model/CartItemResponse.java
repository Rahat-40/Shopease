package com.shopease.backend.model;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {
    private Long productId;
    private String name;
    private Double price;
    private String imageUrl;
    private String sellerEmail;
    private int quantity;
	public Long getProductId() {
		return productId;
	}
	public void setProductId(Long productId) {
		this.productId = productId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public Double getPrice() {
		return price;
	}
	public void setPrice(Double price) {
		this.price = price;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
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
	public CartItemResponse(Long productId, String name, Double price, String imageUrl, String sellerEmail,
			int quantity) {
		super();
		this.productId = productId;
		this.name = name;
		this.price = price;
		this.imageUrl = imageUrl;
		this.sellerEmail = sellerEmail;
		this.quantity = quantity;
	}
	public void setQuantity(int quantity) {
		this.quantity = quantity;
	}
}
