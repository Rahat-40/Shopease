package com.shopease.backend.controller;

import com.shopease.backend.model.OrderPackage;
import com.shopease.backend.services.OrderService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService service;

    public AdminOrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping
    public List<OrderPackage> list(@RequestParam(required = false) String status) {
        return service.listAllForAdminPackages(status);
    }

    @GetMapping("/{packageId}")
    public OrderPackage get(@PathVariable Long packageId) {
        return service.getByIdForAdminPackage(packageId);
    }

    @PutMapping("/{orderId}/status")
    public void setStatus(@PathVariable Long orderId, @RequestParam String status) {
        service.setStatusAdmin(orderId, status);
    }
}
