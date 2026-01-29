package com.shopease.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Autowired
    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())
            // Use the corsConfigurationSource defined at the bottom of this file
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                //  PUBLIC ENDPOINTS
                .requestMatchers("/api/auth/**").permitAll()

                //  ALLOW SSLCOMMERZ CALLBACKS (No JWT required)
                .requestMatchers("/api/orders/payment/**").permitAll()

                // Public GET APIs
                // Public product list + product details ONLY
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/*").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/reviews/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/images/**").permitAll()
                
                // Public Contact form
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/contact").permitAll()
                .requestMatchers("/api/contact/mine").authenticated()

                // File uploads require authentication
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/files/upload").authenticated()

                // ALL OTHER ROUTES NEED JWT
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    //  Global CORS Configuration for Spring Security
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        //  Allow your Frontend (React)
        configuration.setAllowedOrigins(List.of("http://localhost:5173", "http://localhost:3000")); 
        
        //  Allow SSLCommerz (Sandbox & Live)
        // This is what fixes the "Invalid CORS request" from the gateway
        configuration.addAllowedOriginPattern("https://*.sslcommerz.com");
        configuration.addAllowedOriginPattern("https://sandbox.sslcommerz.com");
        
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}