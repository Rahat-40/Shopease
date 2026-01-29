package com.shopease.backend.services;

import com.shopease.backend.model.Order;
import com.shopease.backend.model.OrderPackage;
import com.shopease.backend.model.Product;
import com.shopease.backend.repository.CartItemRepository;
import com.shopease.backend.repository.OrderPackageRepository;
import com.shopease.backend.repository.OrderRepository;
import com.shopease.backend.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.access.AccessDeniedException;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderPackageRepository orderPackageRepository;
    private final ProductRepository productRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(OrderRepository orderRepository,
                        OrderPackageRepository orderPackageRepository,
                        ProductRepository productRepository,
                        CartItemRepository cartItemRepository) {
        this.orderRepository = orderRepository;
        this.orderPackageRepository = orderPackageRepository;
        this.productRepository = productRepository;
        this.cartItemRepository = cartItemRepository;
    }

    //  BUYER 

    public List<OrderPackage> getOrdersByBuyer(String buyerEmail) {
        return orderPackageRepository.findByBuyerEmailOrderByIdDesc(buyerEmail);
    }

    //  SELLER 

//  RETURN PACKAGE-WISE VIEW
    public List<OrderPackage> getPackagesWithSellerOrders(String sellerEmail) {
        // Fetch all individual orders belonging to this seller
        List<Order> sellerOrders = orderRepository.findByProduct_SellerEmailOrderByIdDesc(sellerEmail);

        //  Group them by their OrderPackage ID
        Map<Long, List<Order>> ordersByPackageId = sellerOrders.stream()
                .collect(Collectors.groupingBy(o -> o.getOrderPackage().getId()));

        List<OrderPackage> resultPackages = new ArrayList<>();

        // Reconstruct OrderPackage objects containing ONLY the seller's orders
        for (Map.Entry<Long, List<Order>> entry : ordersByPackageId.entrySet()) {
            List<Order> orders = entry.getValue();

            // Get the original OrderPackage object
            OrderPackage originalPackage = orders.get(0).getOrderPackage();

 
            // ensuring it only contains the relevant orders
            OrderPackage filteredPackage = new OrderPackage();
            
            // Copy essential package-level details
            filteredPackage.setId(originalPackage.getId());
            filteredPackage.setTransactionId(originalPackage.getTransactionId());
            filteredPackage.setBuyerEmail(originalPackage.getBuyerEmail());
            filteredPackage.setStatus(originalPackage.getStatus());
            filteredPackage.setPaymentMethod(originalPackage.getPaymentMethod());
            filteredPackage.setPaymentStatus(originalPackage.getPaymentStatus());
            filteredPackage.setTotalAmount(originalPackage.getTotalAmount());
            filteredPackage.setBuyerName(originalPackage.getBuyerName());
            filteredPackage.setBuyerPhone(originalPackage.getBuyerPhone());
            filteredPackage.setShippingAddress(originalPackage.getShippingAddress());
            filteredPackage.setShippingCity(originalPackage.getShippingCity());
            filteredPackage.setShippingPostcode(originalPackage.getShippingPostcode());
            filteredPackage.setOrderDate(originalPackage.getOrderDate());
            filteredPackage.setCreatedAt(originalPackage.getCreatedAt());

            // Set ONLY the orders belonging to this seller
            filteredPackage.setOrders(orders);
            
            resultPackages.add(filteredPackage);
        }
        
        // Sort packages by ID descending for newest first
        resultPackages.sort(Comparator.comparing(OrderPackage::getId).reversed());

        return resultPackages;
    }

    //  CREATE INITIAL ORDER PENDING - UPDATED FOR COD 

    @Transactional
    public OrderPackage savePendingOrderPackage(OrderPackage orderPackage, String buyerEmail) {
        
        //  Generate Transaction ID
        String trxId = "TRX-" + UUID.randomUUID().toString().substring(0, 8) + "-" + System.currentTimeMillis();
        orderPackage.setTransactionId(trxId);
        orderPackage.setBuyerEmail(buyerEmail);

        //  Determine Initial Status based on Payment Method
        String method = orderPackage.getPaymentMethod() != null ? orderPackage.getPaymentMethod() : "ONLINE";
        
        if ("COD".equalsIgnoreCase(method)) {
            // COD: Starts with a status indicating it's ready for confirmation
            orderPackage.setStatus("PENDING_CONFIRMATION");
            orderPackage.setPaymentStatus("PENDING"); 
        } else {
            // ONLINE: Waiting for SSLCommerz
            orderPackage.setStatus("PENDING_PAYMENT");
            orderPackage.setPaymentStatus("PENDING");
        }

        // Process Items
        for (Order order : orderPackage.getOrders()) {
            Product p = productRepository.findById(order.getProduct().getId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + order.getProduct().getId()));
            
            // Check Stock (Prevention)
            if (p.getStock() < order.getQuantity()) {
                throw new IllegalStateException("Insufficient stock for: " + p.getName());
            }

            order.setProduct(p);
            order.setOrderPackage(orderPackage); 
            order.setBuyerEmail(buyerEmail);
            order.setSellerEmail(p.getSellerEmail());
            order.setUnitPrice(p.getPrice()); 
            
            // Inherit status from package
            order.setStatus(orderPackage.getStatus());
        }
        
        //  Calculate Total and Save
        orderPackage.setTotalAmount(orderPackage.calculateTotal()); 
        return orderPackageRepository.save(orderPackage);
    }

    // FINALIZE COD ORDER (Immediate Stock Deduction) 
    @Transactional
    public OrderPackage finalizeCodOrder(String transactionId) {
        OrderPackage pkg = orderPackageRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Package not found for transaction: " + transactionId));
            
        // Safety check: If already placed, don't deduct stock again
        if ("PLACED".equals(pkg.getStatus())) return pkg; 

        pkg.setPaymentStatus("COD_PENDING"); // Payment is pending collection
        pkg.setStatus("PLACED"); 
        
        for (Order order : pkg.getOrders()) {
            order.setStatus("PLACED"); 
            
            // DEDUCT STOCK IMMEDIATELY
            Product p = order.getProduct();
            if (p.getStock() < order.getQuantity()) {
                throw new IllegalStateException("Stock ran out during processing: " + p.getName());
            }
            p.setStock(p.getStock() - order.getQuantity());
            productRepository.save(p);
            
            //  CLEAR CART
            cartItemRepository.deleteByBuyerEmailAndProductId(pkg.getBuyerEmail(), p.getId());
        }

        return orderPackageRepository.save(pkg);
    }

    // FINALIZE ONLINE PAYMENT (After Callback)

    @Transactional
    public void finalizeOrderPayment(String transactionId) {
        OrderPackage pkg = orderPackageRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Package not found for transaction: " + transactionId));
            
        if ("PAID".equals(pkg.getPaymentStatus())) return; // Prevent double processing

        pkg.setPaymentStatus("PAID");
        pkg.setStatus("PLACED"); 
        
        for (Order order : pkg.getOrders()) {
            order.setStatus("PLACED"); 
            
            //  DEDUCT STOCK
            Product p = order.getProduct();
            p.setStock(p.getStock() - order.getQuantity());
            productRepository.save(p);
            
            //  CLEAR CART
            cartItemRepository.deleteByBuyerEmailAndProductId(pkg.getBuyerEmail(), p.getId());
        }

        orderPackageRepository.save(pkg);
    }
    
    //  HANDLE FAILURES/CANCELS 

    @Transactional
    public void updatePackageStatusAndPayment(String transactionId, String newPaymentStatus) {
        OrderPackage pkg = orderPackageRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Package not found for transaction: " + transactionId));
            
        // Prevent changing status if already paid or placed (COD)
        if ("PAID".equals(pkg.getPaymentStatus()) || "PLACED".equals(pkg.getStatus())) return; 

        pkg.setPaymentStatus(newPaymentStatus); // FAILED or CANCELLED
        pkg.setStatus(newPaymentStatus.equals("FAILED") ? "FAILED" : "CANCELLED"); 
        
        for (Order order : pkg.getOrders()) {
            order.setStatus(pkg.getStatus()); 
        }
        
        orderPackageRepository.save(pkg);
    }

    //  BUYER: CANCEL PACKAGE 

    @Transactional
    public void cancelOrder(Long orderPackageId, String buyerEmail) {
        OrderPackage op = orderPackageRepository.findById(orderPackageId)
                .orElseThrow(() -> new IllegalArgumentException("Order package not found"));

        if (!buyerEmail.equals(op.getBuyerEmail())) {
            throw new AccessDeniedException("Not your package");
        }
        
        // Allow cancellation for PAID orders or COD orders that are placed
        if (!List.of("PAID", "COD_PENDING").contains(op.getPaymentStatus())) {
             throw new IllegalStateException("Cannot cancel an unpaid or pending package.");
        }

        for (Order o : op.getOrders()) {
            if (List.of("PLACED", "CONFIRMED").contains(o.getStatus())) { 
                o.setStatus("CANCELLED");

                //  RESTOCK ITEMS
                Product p = o.getProduct();
                p.setStock(p.getStock() + o.getQuantity()); 
                productRepository.save(p);

                orderRepository.save(o);
            }
        }

        op.setStatus("CANCELLED");
        op.setPaymentStatus("CANCELLED"); 
        orderPackageRepository.save(op);
    }

    public OrderPackage getOrderByTransactionIdAndBuyer(String transactionId, String buyerEmail) {
        OrderPackage pkg = orderPackageRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Order transaction not found."));
        
        //  must belong to the logged-in user
        if (!buyerEmail.equals(pkg.getBuyerEmail())) {
            throw new AccessDeniedException("Access denied to this order.");
        }
        
        return pkg;
    }
    
    //  SELLER: UPDATE ITEM STATUS 

    @Transactional
    public void sellerUpdateOrderStatus(Long orderId, String status, String sellerEmail) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        if (!order.getProduct().getSellerEmail().equals(sellerEmail)) {
            throw new AccessDeniedException("Not your order");
        }
        
        // Prevent seller from processing unpaid orders
        if (!List.of("PAID", "COD_PENDING").contains(order.getOrderPackage().getPaymentStatus())) {
            throw new IllegalStateException("Order is not paid/confirmed. Seller cannot update status.");
        }

        List<String> allowed = List.of("CONFIRMED", "PACKED", "SHIPPED", "DELIVERED");
        if (!allowed.contains(status)) {
            throw new IllegalArgumentException("Invalid seller status: " + status);
        }

        order.setStatus(status);
        orderRepository.save(order);

        if (order.getOrderPackage() != null) {
            recalculatePackageStatus(order.getOrderPackage());
        }
    }

    
    // ADMIN & UTILS 
    
    public List<OrderPackage> listAllForAdminPackages(String status) {
        List<OrderPackage> all = orderPackageRepository.findAll();
        if (status == null || status.isBlank()) return all;
        return all.stream()
                .filter(op -> status.equalsIgnoreCase(op.getStatus()))
                .toList();
    }

    public OrderPackage getByIdForAdminPackage(Long packageId) {
        return orderPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));
    }

    @Transactional
    public void setStatusAdmin(Long orderId, String status) {
        Order o = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        o.setStatus(status);
        orderRepository.save(o);
    }
    
    @Transactional
    public void setPackageStatusAdmin(Long packageId, String status) {
        OrderPackage op = orderPackageRepository.findById(packageId)
                .orElseThrow(() -> new IllegalArgumentException("Package not found"));

        for (Order o : op.getOrders()) {
            o.setStatus(status);
            orderRepository.save(o);
        }

        op.setStatus(status);
        orderPackageRepository.save(op);
    }

    private void recalculatePackageStatus(OrderPackage pack) {
        List<Order> items = pack.getOrders();
        Set<String> uniqueStatuses = items.stream()
                .map(Order::getStatus)
                .collect(Collectors.toSet());

        // Added PENDING_CONFIRMATION to priority list
        List<String> priority = List.of("PENDING_PAYMENT", "PENDING_CONFIRMATION", "PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "FAILED");

        String newStatus;
        if (uniqueStatuses.size() == 1) {
            newStatus = uniqueStatuses.iterator().next();
        } else {
            newStatus = uniqueStatuses.stream()
                    .min(Comparator.comparingInt(priority::indexOf))
                    .orElse("PENDING_PAYMENT");
        }

        if (!Objects.equals(pack.getStatus(), newStatus)) {
            pack.setStatus(newStatus);
            orderPackageRepository.save(pack);
        }
    }
}