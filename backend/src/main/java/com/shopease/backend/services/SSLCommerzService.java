package com.shopease.backend.services;

import com.shopease.backend.model.OrderPackage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
public class SSLCommerzService {

    @Value("${sslcommerz.store.id}") private String storeId;
    @Value("${sslcommerz.store.password}") private String storePassword;
    @Value("${sslcommerz.api.initiate}") private String initiateUrl;
    @Value("${sslcommerz.api.validation}") private String validationUrl;
    @Value("${app.base.url}") private String appBaseUrl;

    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();

    public SSLCommerzService(OrderService orderService) {
        this.orderService = orderService;
    }

    // initiate transaction
    public String initiateTransaction(OrderPackage pkg) {

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();

        params.add("store_id", storeId);
        params.add("store_passwd", storePassword);
        params.add("total_amount", String.format("%.2f", pkg.getTotalAmount()));
        params.add("currency", "BDT");
        params.add("tran_id", pkg.getTransactionId());

        // ---  CALLBACK URLS ---
        params.add("success_url", appBaseUrl + "/api/orders/payment/success");
        params.add("fail_url", appBaseUrl + "/api/orders/payment/fail");
        params.add("cancel_url", appBaseUrl + "/api/orders/payment/cancel");

        // --- Customer Info  ---
        params.add("cus_name", pkg.getBuyerName());
        params.add("cus_phone", pkg.getBuyerPhone());
        params.add("cus_email", pkg.getBuyerEmail());
        params.add("cus_add1", pkg.getShippingAddress());
        params.add("cus_city", pkg.getShippingCity());
        params.add("cus_postcode", pkg.getShippingPostcode());
        params.add("cus_country", "Bangladesh");

        // --- Shipping Info ---
        params.add("ship_name", pkg.getBuyerName());
        params.add("ship_add1", pkg.getShippingAddress());
        params.add("ship_city", pkg.getShippingCity());
        params.add("ship_postcode", pkg.getShippingPostcode());
        params.add("ship_country", "Bangladesh");

        params.add("product_name", "E-commerce Order #" + pkg.getId());
        params.add("product_category", "Goods");
        params.add("product_profile", "general");
        params.add("shipping_method", "Courier");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response =
                restTemplate.exchange(initiateUrl, HttpMethod.POST, request, Map.class);

        if (response.getBody() != null && "SUCCESS".equals(response.getBody().get("status"))) {
            return (String) response.getBody().get("GatewayPageURL");
        }

        orderService.updatePackageStatusAndPayment(pkg.getTransactionId(), "FAILED");
        throw new RuntimeException("SSLCommerz initiation failed: " +
                response.getBody().get("failedreason"));
    }

    //  Validate transaction
    @Transactional
    public boolean validateAndFinalizeTransaction(Map<String, String> postData) {

        String transactionId = postData.get("tran_id");
        String valId = postData.get("val_id");

        
        String fullValidationUrl = validationUrl
                + "?val_id=" + valId
                + "&store_id=" + storeId
                + "&store_passwd=" + storePassword
                + "&format=json";

        ResponseEntity<Map> validationResponse =
                restTemplate.getForEntity(fullValidationUrl, Map.class);

        if (validationResponse.getBody() != null &&
                "VALID".equals(validationResponse.getBody().get("status"))) {

            try {
                orderService.finalizeOrderPayment(transactionId);
                return true;
            } catch (Exception e) {
                return false;
            }
        }

        orderService.updatePackageStatusAndPayment(transactionId, "FAILED");
        return false;
    }
}
