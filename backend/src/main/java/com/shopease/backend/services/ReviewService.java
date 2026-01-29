package com.shopease.backend.services;

import com.shopease.backend.model.Product;
import com.shopease.backend.model.Review;
import com.shopease.backend.repository.ProductRepository;
import com.shopease.backend.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    public List<Review> getReviewsForProduct(Long productId) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return reviewRepository.findByProductOrderByCreatedAtDesc(p);
    }

    @Transactional
    public Review addReview(Long productId, Integer rating, String comment, String userEmail) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be 1–5");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getSellerEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller cannot review own product");
        }

        if (reviewRepository.existsByProductAndUserEmail(product, userEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already reviewed this product");
        }

        Review r = new Review();
        r.setRating(rating);
        r.setComment(comment == null ? "" : comment.trim());
        r.setUserEmail(userEmail);
        r.setProduct(product);

        Review saved = reviewRepository.save(r);

        recalcProductRating(product);
        return saved;
    }
    
    @Transactional
    private void recalcProductRating(Product product) {
        List<Review> all = reviewRepository.findByProductOrderByCreatedAtDesc(product);

        double avg = all.stream().mapToInt(Review::getRating).average().orElse(0.0);

        product.setAvgRating(avg);
        product.setTotalReviews(all.size());
        productRepository.save(product);
    }
}
