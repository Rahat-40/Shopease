package com.shopease.backend.repository;

import com.shopease.backend.model.ContactReply;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContactReplyRepository extends JpaRepository<ContactReply, Long> {
  List<ContactReply> findByMessageIdOrderByCreatedAtAsc(Long messageId);
}
