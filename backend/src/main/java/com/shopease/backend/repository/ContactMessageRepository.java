package com.shopease.backend.repository;

import com.shopease.backend.model.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {
  List<ContactMessage> findByUserEmailOrderByUpdatedAtDesc(String userEmail);
  List<ContactMessage> findByStatusOrderByUpdatedAtDesc(ContactMessage.Status status);
}
