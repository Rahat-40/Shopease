package com.shopease.backend.controller;

import com.shopease.backend.model.Order;
import com.shopease.backend.model.OrderPackage;
import com.shopease.backend.services.OrderService;
import com.shopease.backend.services.SSLCommerzService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders") 
public class OrderController {

    @Autowired private OrderService orderService;
    @Autowired private SSLCommerzService sslCommerzService; 
    
    @Value("${app.frontend.url}")
    private String frontendBaseUrl; 

    //  GET ENDPOINTS 
    @PreAuthorize("hasRole('BUYER')")
    @GetMapping("/buyer/me")
    public List<OrderPackage> buyerOrders(Authentication auth) {
        return orderService.getOrdersByBuyer(auth.getName());
    }
    
 // Endpoint for OrderSuccess to fetch order details
    @PreAuthorize("hasRole('BUYER')")
    @GetMapping("/buyer/transaction/{transactionId}")
    public OrderPackage getOrderByTransactionId(@PathVariable String transactionId, Authentication auth) {
        return orderService.getOrderByTransactionIdAndBuyer(transactionId, auth.getName());
    }

    @PreAuthorize("hasRole('SELLER')")
    @GetMapping("/seller/me")
    public List<OrderPackage> sellerOrders(Authentication auth) {
        return orderService.getPackagesWithSellerOrders(auth.getName());
    }

 // Online Payment Initiation (SSLCommerz)
    @PreAuthorize("hasRole('BUYER')")
    @PostMapping("/buyer/initiate")
    public String initiatePayment(@RequestBody OrderPackage orderPackagePayload, Authentication auth) {
        OrderPackage pendingOp = orderService.savePendingOrderPackage(orderPackagePayload, auth.getName());
        return sslCommerzService.initiateTransaction(pendingOp);
    }
    
    // Cash on Delivery (COD) Placement
    @PreAuthorize("hasRole('BUYER')")
    @PostMapping("/buyer/cod")
    public OrderPackage placeCodOrder(@RequestBody OrderPackage orderPackagePayload, Authentication auth) {
        
        OrderPackage pendingPkg = orderService.savePendingOrderPackage(orderPackagePayload, auth.getName());
        OrderPackage finalizedPkg = orderService.finalizeCodOrder(pendingPkg.getTransactionId());
        
        return finalizedPkg;
    }

 //PAYMENT CALLBACKS (SSLCommerz) 

    //  SUCCESS

    @PostMapping(value = "/payment/success", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public RedirectView handlePaymentSuccess(@RequestParam Map<String, String> postData) {
        String transactionId = postData.get("tran_id");
        
        boolean isValid = sslCommerzService.validateAndFinalizeTransaction(postData);
        
        if (isValid) {
            return new RedirectView(frontendBaseUrl + "/order/success/" + transactionId);
        } else {
            return new RedirectView(frontendBaseUrl + "/order/fail/" + transactionId);
        }
    }

    // Handle Payment FAILED
    @PostMapping(value = "/payment/fail", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public RedirectView handlePaymentFailure(@RequestParam Map<String, String> postData) {
        String transactionId = postData.getOrDefault("tran_id", "UNKNOWN");
        orderService.updatePackageStatusAndPayment(transactionId, "FAILED"); 
        return new RedirectView(frontendBaseUrl + "/order/fail/" + transactionId);
    }

    // Handle Payment CANCELLED
    @PostMapping(value = "/payment/cancel", consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public RedirectView handlePaymentCancel(@RequestParam Map<String, String> postData) {
        String transactionId = postData.getOrDefault("tran_id", "UNKNOWN");
        orderService.updatePackageStatusAndPayment(transactionId, "CANCELLED"); 
        return new RedirectView(frontendBaseUrl + "/order/fail/" + transactionId);
    }



    @PreAuthorize("hasRole('BUYER')")
    @PutMapping("/buyer/cancel/{orderPackageId}")
    public void cancelOrder(@PathVariable Long orderPackageId, Authentication auth) {
        orderService.cancelOrder(orderPackageId, auth.getName());
    }

    @PreAuthorize("hasRole('SELLER')")
    @PutMapping("/order/{orderId}/status")
    public void updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam String status,
            Authentication auth
    ) {
        orderService.sellerUpdateOrderStatus(orderId, status, auth.getName());
    }
}