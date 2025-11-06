package com.shopease.backend.controller;

import com.shopease.backend.model.Product;
import com.shopease.backend.services.ProductService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Validated
public class ProductController {

    private final ProductService productService;
    @Autowired
    public ProductController(ProductService productService) { this.productService = productService; }

    @GetMapping
    public List<Product> getAll(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String order
    ) {
        return productService.searchPublic(q, category, sortBy, order);
    }

    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/seller/me")
    public List<Product> getMyProducts(
            Authentication auth,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "name") String sortBy,
            @RequestParam(required = false, defaultValue = "asc") String order
    ) {
        return productService.searchSeller(auth.getName(), q, category, sortBy, order);
    }

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) { return productService.getProductById(id); }

    @PreAuthorize("hasRole('SELLER')")
    @PostMapping
    public Product add(@Valid @RequestBody Product product, Authentication auth) {
        return productService.addProduct(product, auth.getName());
    }

    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product, Authentication auth) {
        return productService.updateProductOwned(id, product, auth.getName());
    }

    @PreAuthorize("hasRole('SELLER')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, Authentication auth) {
        productService.deleteProductOwned(id, auth.getName());
    }
}
