package com.shopease.backend.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name="contact_messages")
public class ContactMessage {

  public enum Status { OPEN, RESPONDED, CLOSED }

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column
  private String userEmail;

  @Column
  private String name;

  @Column
  private String subject;

  @Column(columnDefinition = "TEXT")
  private String message;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.OPEN;

  @Column(nullable = false)
  private Instant createdAt = Instant.now();

  @Column(nullable = false)
  private Instant updatedAt = Instant.now();

  @JsonManagedReference
  @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
  private List<ContactReply> replies = new ArrayList<>();

  @PrePersist
  public void onCreate() {
    Instant now = Instant.now();
    this.createdAt = now;
    this.updatedAt = now;
  }

  @PreUpdate
  public void onUpdate() {
    this.updatedAt = Instant.now();
  }

  // Getters and Setters
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUserEmail() { return userEmail; }
  public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getSubject() { return subject; }
  public void setSubject(String subject) { this.subject = subject; }

  public String getMessage() { return message; }
  public void setMessage(String message) { this.message = message; }

  public Status getStatus() { return status; }
  public void setStatus(Status status) { this.status = status; }

  public Instant getCreatedAt() { return createdAt; }
  public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

  public Instant getUpdatedAt() { return updatedAt; }
  public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

  public List<ContactReply> getReplies() { return replies; }
  public void setReplies(List<ContactReply> replies) { this.replies = replies; }
}
