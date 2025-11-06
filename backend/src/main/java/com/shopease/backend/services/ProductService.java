package com.shopease.backend.services;

import com.shopease.backend.model.Product;
import com.shopease.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    public List<Product> searchPublic(String q, String category, String sortBy, String order) {
        boolean hasQ = q != null && !q.isBlank();
        boolean hasC = category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category);

        List<Product> list;
        if (hasC && hasQ) list = productRepository.findByActiveTrueAndCategoryIgnoreCaseAndNameContainingIgnoreCase(category, q);
        else if (hasC) list = productRepository.findByActiveTrueAndCategoryIgnoreCase(category);
        else if (hasQ) list = productRepository.findByActiveTrueAndNameContainingIgnoreCase(q);
        else list = productRepository.findByActiveTrue();

        sortInMemory(list, sortBy, order);
        return list;
    }

    public List<Product> searchSeller(String sellerEmail, String q, String category, String sortBy, String order) {
        boolean hasQ = q != null && !q.isBlank();
        boolean hasC = category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category);

        List<Product> list;
        if (hasC && hasQ) list = productRepository.findBySellerEmailAndCategoryIgnoreCaseAndNameContainingIgnoreCase(sellerEmail, category, q);
        else if (hasC) list = productRepository.findBySellerEmailAndCategoryIgnoreCase(sellerEmail, category);
        else if (hasQ) list = productRepository.findBySellerEmailAndNameContainingIgnoreCase(sellerEmail, q);
        else list = productRepository.findBySellerEmail(sellerEmail);

        sortInMemory(list, sortBy, order);
        return list;
    }

    private void sortInMemory(List<Product> list, String sortBy, String order) {
        Comparator<Product> cmp = Comparator.comparing(Product::getName, String.CASE_INSENSITIVE_ORDER);
        if ("price".equalsIgnoreCase(sortBy)) cmp = Comparator.comparing(p -> p.getPrice() == null ? 0.0 : p.getPrice());
        if ("stock".equalsIgnoreCase(sortBy)) cmp = Comparator.comparing(p -> p.getStock() == null ? 0 : p.getStock());
        if ("category".equalsIgnoreCase(sortBy)) cmp = Comparator.comparing(p -> p.getCategory() == null ? "" : p.getCategory(), String.CASE_INSENSITIVE_ORDER);
        if ("desc".equalsIgnoreCase(order)) cmp = cmp.reversed();
        list.sort(cmp);
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
    }

    public Product addProduct(Product product, String sellerEmail) {
        product.setSellerEmail(sellerEmail);
        if (product.getCategory() == null) product.setCategory("");
        if (product.getPrice() == null) product.setPrice(0.0);
        if (product.getStock() == null) product.setStock(0);
        if (!product.isActive()) product.setActive(true);
        return productRepository.save(product);
    }

    public Product updateProductOwned(Long id, Product patch, String sellerEmail) {
        Product existing = getProductById(id);
        if (!existing.getSellerEmail().equalsIgnoreCase(sellerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your product");
        }
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
        if (patch.getPrice() != null) existing.setPrice(patch.getPrice());
        if (patch.getStock() != null) existing.setStock(patch.getStock());
        if (patch.getImageUrl() != null) existing.setImageUrl(patch.getImageUrl());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        existing.setActive(patch.isActive());
        return productRepository.save(existing);
    }

    public void deleteProductOwned(Long id, String sellerEmail) {
        Product existing = getProductById(id);
        if (!existing.getSellerEmail().equalsIgnoreCase(sellerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your product");
        }
        productRepository.delete(existing);
    }
    
    
    // for admin
 // Return all products (active+inactive) with simple filters
    public List<Product> listAllForAdmin(String q, String category) {
      List<Product> all = productRepository.findAll();
      return all.stream()
        .filter(p -> q == null || q.isBlank() || (p.getName()!=null && p.getName().toLowerCase().contains(q.toLowerCase())))
        .filter(p -> category == null || category.isBlank() || "ALL".equalsIgnoreCase(category) || category.equalsIgnoreCase(p.getCategory()))
        .toList();
    }

    // Update without seller ownership check
    public Product updateProductAdmin(Long id, Product patch) {
      Product existing = getProductById(id);
      if (patch.getName() != null) existing.setName(patch.getName());
      if (patch.getDescription() != null) existing.setDescription(patch.getDescription());
      if (patch.getPrice() != null) existing.setPrice(patch.getPrice());
      if (patch.getStock() != null) existing.setStock(patch.getStock());
      if (patch.getImageUrl() != null) existing.setImageUrl(patch.getImageUrl());
      if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
      // only flip to false if explicitly provided; otherwise keep
      if (patch.isActive() != existing.isActive()) existing.setActive(patch.isActive());
      return productRepository.save(existing);
    }

    public Product setActiveByAdmin(Long id, boolean active) {
      Product p = getProductById(id);
      p.setActive(active);
      return productRepository.save(p);
    }

    public void deleteByAdmin(Long id) {
      productRepository.deleteById(id);
    }


    
}
