package com.shopease.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name="contact_replies")
public class ContactReply {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @JsonBackReference
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="message_id")
  private ContactMessage message;

  @Column
  private String responderEmail;

  @Column(columnDefinition = "TEXT")
  private String body;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public ContactMessage getMessage() { return message; }
  public void setMessage(ContactMessage message) { this.message = message; }

  public String getResponderEmail() { return responderEmail; }
  public void setResponderEmail(String responderEmail) { this.responderEmail = responderEmail; }

  public String getBody() { return body; }
  public void setBody(String body) { this.body = body; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
