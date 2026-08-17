package com.shopease.backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http
    ) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .cors(cors ->
                cors.configurationSource(
                    corsConfigurationSource()
                )
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // =============================================
                // PUBLIC AUTH
                // =============================================

                .requestMatchers(
                    "/api/auth/**"
                ).permitAll()

                // =============================================
                // SSLCommerz CALLBACKS
                // =============================================

                .requestMatchers(
                    "/api/orders/payment/**"
                ).permitAll()

                // =============================================
                // PUBLIC PRODUCT APIs
                // =============================================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/products/*"
                ).permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/reviews/**"
                ).permitAll()

                // =============================================
                // PUBLIC CONTACT
                // =============================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/contact"
                ).permitAll()

                // =============================================
                // IMAGE UPLOAD
                // =============================================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/files/upload"
                ).authenticated()

                // =============================================
                // EVERYTHING ELSE
                // =============================================

                .anyRequest().authenticated()
            )

            .addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =========================================================
    // AUTHENTICATION MANAGER
    // =========================================================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {

        return config.getAuthenticationManager();
    }

    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        // Production React frontend
        configuration.setAllowedOrigins(
                List.of(
                    frontendUrl,
                    "http://localhost:5173",
                    "http://localhost:3000"
                )
        );

        configuration.setAllowedMethods(
                Arrays.asList(
                    "GET",
                    "POST",
                    "PUT",
                    "PATCH",
                    "DELETE",
                    "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                Arrays.asList(
                    "Authorization",
                    "Content-Type",
                    "X-Requested-With",
                    "Accept"
                )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}