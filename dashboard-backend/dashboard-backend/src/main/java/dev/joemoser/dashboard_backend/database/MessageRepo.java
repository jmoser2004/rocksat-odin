package dev.joemoser.dashboard_backend.database;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageRepo extends JpaRepository<Message, Long>
{
    List<Message> findByMessageId(String messageId);
    List<Message> findByType(String type);
    List<Message> findByTimestamp(String timestamp);
    Optional<Message> findTopByTypeOrderByIdDesc(String type);
}
