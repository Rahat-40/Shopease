package com.shopease.backend.services;

import com.shopease.backend.model.ContactMessage;
import com.shopease.backend.model.ContactReply;
import com.shopease.backend.repository.ContactMessageRepository;
import com.shopease.backend.repository.ContactReplyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class ContactService {

  private final ContactMessageRepository messages;
  private final ContactReplyRepository replies;

  public ContactService(ContactMessageRepository messages, ContactReplyRepository replies) {
    this.messages = messages; this.replies = replies;
  }

  @Transactional
  public Long create(String name, String email, String subject, String body, String authEmail) {
    ContactMessage m = new ContactMessage();
    m.setUserEmail((authEmail != null && !authEmail.isBlank()) ? authEmail : email);
    m.setName(name);
    m.setSubject(subject);
    m.setMessage(body);
    m.setStatus(ContactMessage.Status.OPEN);
    return messages.save(m).getId();
  }

  @Transactional(readOnly = true)
  public List<ContactMessage> listMine(String userEmail) {
    return messages.findByUserEmailOrderByUpdatedAtDesc(userEmail);
  }

  @Transactional(readOnly = true)
  public ContactMessage getThreadForUser(Long id, String userEmail) {
    ContactMessage m = messages.findById(id).orElseThrow();
    if (!Objects.equals(m.getUserEmail(), userEmail)) throw new SecurityException("Forbidden");
    // replies are LAZY; if the controller needs them serialized, ensure transaction is open or access m.getReplies().size()
    return m;
  }

  @Transactional(readOnly = true)
  public List<ContactMessage> listAll(String status) {
    List<ContactMessage> all = (status == null || status.isBlank())
      ? messages.findAll()
      : messages.findByStatusOrderByUpdatedAtDesc(ContactMessage.Status.valueOf(status));
    return all.stream()
      .sorted(Comparator.comparing(ContactMessage::getUpdatedAt).reversed())
      .toList();
  }

  @Transactional(readOnly = true)
  public ContactMessage getThreadForAdmin(Long id) {
    return messages.findById(id).orElseThrow();
  }

  @Transactional
  public void adminReply(Long id, String body, String adminEmail) {
    ContactMessage m = messages.findById(id).orElseThrow();
    ContactReply r = new ContactReply();
    r.setMessage(m);
    r.setBody(body);
    r.setResponderEmail(adminEmail);
    replies.save(r);
    m.setStatus(ContactMessage.Status.RESPONDED);
    messages.save(m);
  }

  @Transactional
  public void deleteTicketByAdmin(Long id) {
    messages.deleteById(id);
  }
}
