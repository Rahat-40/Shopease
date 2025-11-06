package com.shopease.backend.controller;

import com.shopease.backend.model.Product;
import com.shopease.backend.services.ProductService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {
  private final ProductService service;
  public AdminProductController(ProductService service){ this.service = service; }

  @GetMapping
  public List<Product> list(@RequestParam(required=false) String q,
                            @RequestParam(required=false) String category){
    return service.listAllForAdmin(q, category);
  }

  @PutMapping("/{id}")
  public Product update(@PathVariable Long id, @RequestBody Product patch){
    return service.updateProductAdmin(id, patch);
  }

  @PutMapping("/{id}/active")
  public Product setActive(@PathVariable Long id, @RequestParam boolean active){
    return service.setActiveByAdmin(id, active);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id){
    service.deleteByAdmin(id);
  }
}
